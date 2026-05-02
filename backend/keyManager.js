const scraper = require("./scraper");
const supabaseApi = require("./supabaseApi");

/**
 * KeyManager handles rotation, health monitoring, and proactive recovery of API keys.
 * Offloaded to Supabase for high-frequency updates.
 */
class KeyManager {
    constructor(userId, provider) {
        this.userId = userId;
        this.provider = provider;
        this.keys = [];
        this.currentIndex = 0;
        this.keyStatus = new Map(); // keyString -> status object
        this.COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown for failed/rate_limited keys
    }

    getActiveCount() {
        return Array.from(this.keyStatus.values()).filter(s => s.currentStatus === 'active').length;
    }

    async initialize() {
        const providerKeys = await supabaseApi.getUserApiKeys(this.userId, this.provider);

        // Initial categorizing
        const activeKeys = providerKeys.filter(k => k.status === 'active');
        const candidateKeys = providerKeys.filter(k => k.status !== 'active' && k.status !== 'inactive');

        // Strategy: Maintain a threshold of at least 5 active keys
        if (activeKeys.length < 5 && candidateKeys.length > 0) {
            console.log(`🧰 Active keys below threshold (${activeKeys.length}/5). Attempting recovery...`);
            await this.recovery(candidateKeys);

            // Re-fetch after recovery to get fresh statuses
            const refreshedKeys = await supabaseApi.getUserApiKeys(this.userId, this.provider);
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
                id: k.id,
                name: k.name || "Unnamed Key",
                originalStatus: k.status,
                currentStatus: k.status,
                used: false,
                successes: 0,
                failures: 0,
                lastUsed: k.last_used_at ? new Date(k.last_used_at).getTime() : 0
            });
        });

        // Sort by lastUsed to maintain LRU (Least Recently Used) rotation
        this.keys.sort((a, b) => {
            const timeA = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
            const timeB = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
            return timeA - timeB;
        });

        return this.keys.length;
    }

    /**
     * Parallel recovery of keys that are not currently active
     */
    async recovery(keysToTest) {
        const now = Date.now();
        const eligibeToTest = keysToTest.filter(k => {
            const lastUsed = k.last_used_at ? new Date(k.last_used_at).getTime() : 0;
            return (now - lastUsed) > this.COOLDOWN_MS;
        });

        if (eligibeToTest.length === 0) return;

        console.log(`🧪 Testing ${eligibeToTest.length} keys in parallel for recovery...`);

        const results = await Promise.allSettled(eligibeToTest.map(async (k) => {
            const test = await scraper.testKey(k.key);
            if (test.success) {
                console.log(`   ✅ Key [${k.name || k.key.slice(-6)}] recovered!`);
                await supabaseApi.updateUserApiKeyStatus(k.id, 'active');
                return { key: k.key, status: 'active' };
            } else {
                const newStatus = (test.status === 429) ? 'rate_limited' : 'failed';
                console.log(`   ❌ Key [${k.name || k.key.slice(-6)}] recovery failed: ${test.message}`);
                await supabaseApi.updateUserApiKeyStatus(k.id, newStatus);
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

        // Emergency recovery
        if (!foundKey) {
            console.log("⚠️  No active keys found in set. Attempting emergency recovery check...");
            await this.ensureMaxAvailability();

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

        // Final fallback
        if (!foundKey) {
            console.warn("⚠️  Still no active keys after recovery attempt. Falling back to next available key.");
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

        if (![401, 402, 403, 429].includes(errorStatus)) {
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

    async ensureMaxAvailability() {
        console.log("⚡ Proactively checking all potentially usable keys in Supabase...");
        const providerKeys = await supabaseApi.getUserApiKeys(this.userId, this.provider);
        const candidates = providerKeys.filter(k => k.status !== 'active' && k.status !== 'inactive');

        if (candidates.length > 0) {
            await this.recovery(candidates);

            const freshKeys = await supabaseApi.getUserApiKeys(this.userId, this.provider);
            this.keys = freshKeys.filter(k => k.status === 'active');

            this.keys.forEach(k => {
                const existingStatus = this.keyStatus.get(k.key);
                if (!existingStatus) {
                    this.keyStatus.set(k.key, {
                        id: k.id,
                        name: k.name || "Unnamed Key",
                        originalStatus: k.status,
                        currentStatus: k.status,
                        used: false,
                        successes: 0,
                        failures: 0,
                        lastUsed: k.last_used_at ? new Date(k.last_used_at).getTime() : 0
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
            await this.ensureMaxAvailability();
        }
    }

    async sync() {
        for (const [keyString, status] of this.keyStatus.entries()) {
            if (status.used) {
                // Update status in Supabase
                await supabaseApi.updateUserApiKeyStatus(status.id, status.currentStatus);
                
                // If successful use, increment usage count
                if (status.successes > 0) {
                    await supabaseApi.incrementApiKeyUsage(status.id);
                }
            }
        }
    }
}

module.exports = KeyManager;

