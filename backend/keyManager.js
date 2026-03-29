const scraper = require("./scraper");

/**
 * KeyManager handles rotation, health monitoring, and proactive recovery of API keys.
 */
class KeyManager {
    constructor(userId, provider, convexApi) {
        this.userId = userId;
        this.provider = provider;
        this.convex = convexApi;
        this.keys = [];
        this.currentIndex = 0;
        this.keyStatus = new Map(); // keyString -> status object
        this.COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown for failed/rate_limited keys
    }

    getActiveCount() {
        return Array.from(this.keyStatus.values()).filter(s => s.currentStatus === 'active').length;
    }

    async initialize() {
        const providerKeys = await this.convex.getApiKeys(this.userId, this.provider);

        // Initial categorizing
        const activeKeys = providerKeys.filter(k => k.status === 'active');
        const candidateKeys = providerKeys.filter(k => k.status !== 'active' && k.status !== 'inactive');

        // Strategy: Maintain a threshold of at least 5 active keys
        if (activeKeys.length < 5 && candidateKeys.length > 0) {
            console.log(`🧰 Active keys below threshold (${activeKeys.length}/5). Attempting recovery...`);
            await this.recovery(candidateKeys);

            // Re-fetch after recovery to get fresh statuses
            const refreshedKeys = await this.convex.getApiKeys(this.userId, this.provider);
            this.keys = refreshedKeys.filter(k => k.status === 'active');
        } else {
            this.keys = activeKeys;
        }

        // Fallback: If still no active keys, attempt to use ones that haven't failed recently
        if (this.keys.length === 0) {
            console.warn("⚠️ No active keys found. Falling back to non-inactive keys.");
            this.keys = providerKeys.filter(k => k.status !== 'inactive');
        }

        this.keys.forEach(k => {
            this.keyStatus.set(k.key, {
                id: k._id,
                name: k.name || "Unnamed Key",
                originalStatus: k.status,
                currentStatus: k.status,
                used: false,
                successes: 0,
                failures: 0,
                lastUsed: k.lastUsedAt || 0
            });
        });

        // Sort by lastUsed to maintain LRU (Least Recently Used) rotation
        this.keys.sort((a, b) => (a.lastUsedAt || 0) - (b.lastUsedAt || 0));

        return this.keys.length;
    }

    /**
     * Parallel recovery of keys that are not currently active
     * Only tests keys where cooldown has expired or status is just 'rate_limited'
     */
    async recovery(keysToTest) {
        const now = Date.now();
        const eligibeToTest = keysToTest.filter(k => {
            if (!k.lastUsedAt) return true;
            return (now - k.lastUsedAt) > this.COOLDOWN_MS;
        });

        if (eligibeToTest.length === 0) return;

        console.log(`🧪 Testing ${eligibeToTest.length} keys in parallel for recovery...`);

        const results = await Promise.allSettled(eligibeToTest.map(async (k) => {
            const test = await scraper.testKey(k.key);
            if (test.success) {
                console.log(`   ✅ Key [${k.name || k.key.slice(-6)}] recovered!`);
                await this.convex.updateApiKeyStatus(this.userId, this.provider, k.key, 'active', false);
                return { key: k.key, status: 'active' };
            } else {
                const newStatus = (test.status === 429) ? 'rate_limited' : 'failed';
                console.log(`   ❌ Key [${k.name || k.key.slice(-6)}] recovery failed: ${test.message}`);
                // Only update if status actually changed or to refresh lastUsedAt
                await this.convex.updateApiKeyStatus(this.userId, this.provider, k.key, newStatus, false);
                return { key: k.key, status: newStatus };
            }
        }));

        const recovered = results.filter(r => r.status === 'fulfilled' && r.value.status === 'active').length;
        console.log(`✅ Recovery complete: ${recovered} keys reactivated.`);
    }

    /**
     * Get next available key using Round-Robin / LRU strategy
     */
    async getNextKey() {
        if (this.keys.length === 0) throw new Error(`No ${this.provider} keys available`);

        const startIdx = this.currentIndex % this.keys.length;
        let foundKey = null;

        for (let i = 0; i < this.keys.length; i++) {
            const idx = (startIdx + i) % this.keys.length;
            const key = this.keys[idx];
            const status = this.keyStatus.get(key.key);

            if (status.currentStatus === 'active') {
                this.currentIndex = idx + 1;
                foundKey = key;
                break;
            }
        }

        // Emergency recovery: If no active keys found in current set, try one last recovery check
        if (!foundKey) {
            console.log("⚠️  No active keys found in set. Attempting emergency recovery check...");
            await this.ensureMaxAvailability();

            // Try one more time after recovery
            for (let i = 0; i < this.keys.length; i++) {
                const key = this.keys[i];
                const status = this.keyStatus.get(key.key);
                if (status.currentStatus === 'active') {
                    foundKey = key;
                    this.currentIndex = i + 1;
                    break;
                }
            }
        }

        // Final fallback: just return the next one even if it was previously rate_limited
        if (!foundKey) {
            console.warn("⚠️  Still no active keys after recovery attempt. Falling back to next available key in rotation.");
            foundKey = this.keys[this.currentIndex % this.keys.length];
            this.currentIndex++;
        }

        const status = this.keyStatus.get(foundKey.key);
        console.log(`🔑 Using Key: [${status.name}] (...${foundKey.key.slice(-6)}) | Status: ${status.currentStatus}`);
        return foundKey;
    }

    markSuccess(keyString) {
        const status = this.keyStatus.get(keyString);
        if (status) {
            status.successes++;
            status.used = true;
            status.currentStatus = 'active';
        }
    }

    markFailure(keyString, errorStatus) {
        const status = this.keyStatus.get(keyString);
        if (!status) return;

        // 401: Unauthorized, 402: Payment, 403: Forbidden/Restricted, 429: Rate limited
        if (![401, 402, 403, 429].includes(errorStatus)) {
            console.log(`      🧪 Key [${status.name}]: Error status ${errorStatus} is NOT a key problem. Maintaining active status.`);
            return;
        }

        status.failures++;
        status.used = true;

        if (errorStatus === 429) {
            status.currentStatus = 'rate_limited';
            console.log(`      ⏳ Key [${status.name}] marked as RATE_LIMITED`);
        } else {
            status.currentStatus = 'failed';
            console.log(`      ❌ Key [${status.name}] marked as FAILED`);
        }
    }

    /**
     * Aggressively try to recover ALL potentially usable keys (for big parallel jobs)
     */
    async ensureMaxAvailability() {
        console.log("⚡ Proactively checking all potentially usable keys to maximize parallel research capacity...");
        const providerKeys = await this.convex.getApiKeys(this.userId, this.provider);
        const candidates = providerKeys.filter(k => k.status !== 'active' && k.status !== 'inactive');

        if (candidates.length > 0) {
            await this.recovery(candidates);

            // Re-sync this.keys and this.keyStatus
            const freshKeys = await this.convex.getApiKeys(this.userId, this.provider);
            this.keys = freshKeys.filter(k => k.status === 'active');

            // Update internal status map
            this.keys.forEach(k => {
                const existingStatus = this.keyStatus.get(k.key);
                if (!existingStatus) {
                    this.keyStatus.set(k.key, {
                        id: k._id,
                        name: k.name || "Unnamed Key",
                        originalStatus: k.status,
                        currentStatus: k.status,
                        used: false,
                        successes: 0,
                        failures: 0,
                        lastUsed: k.lastUsedAt || 0
                    });
                } else {
                    existingStatus.currentStatus = 'active';
                }
            });
        }
        return this.keys.length;
    }

    async refreshIfLow() {
        const activeCount = Array.from(this.keyStatus.values())
            .filter(s => s.currentStatus === 'active').length;

        if (activeCount < 2) {
            console.log("🚨 Critical key shortage during job. Refreshing...");
            await this.ensureMaxAvailability();
        }
    }

    async sync() {
        for (const [keyString, status] of this.keyStatus.entries()) {
            if (status.used) {
                await this.convex.updateApiKeyStatus(
                    this.userId,
                    this.provider,
                    keyString,
                    status.currentStatus,
                    status.successes > 0  // incrementUsage
                );
            }
        }
    }
}

module.exports = KeyManager;

