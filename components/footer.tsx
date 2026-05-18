"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBrandX,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

const SubscribeForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        toast.success("Subscribed successfully!");
      } else {
        throw new Error();
      }
    } catch {
      setStatus("error");
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <p className="mt-6 text-sm text-muted-foreground font-medium">
        🎉 Thanks for subscribing!
      </p>
    );
  }

  return (
    <form className="mt-6 flex items-center gap-2" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Enter your email"
        className="grow max-w-64 rounded-full px-4 h-10"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === "loading"}
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full px-5 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </Button>
    </form>
  );
};

const footerSections = [

  {
    title: "Resources",
    links: [
      {
        title: "Blog",
        href: "/blog",
      },
      {
        title: "LinkedIn Guide",
        href: "/blog/ultimate-guide-audience-research",
      },
      {
        title: "Contact Us",
        href: "/contact",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        title: "Terms of Service",
        href: "/terms",
      },
      {
        title: "Privacy Policy",
        href: "/privacy",
      },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t bg-transparent">
      <div className="max-w-(--breakpoint-xl) mx-auto">
        <div className="py-12 flex flex-col md:flex-row justify-between gap-10 px-6 xl:px-0">
          <div className="max-w-sm">
            {/* Logo */}
            <Logo />

            <p className="mt-4 text-muted-foreground">
              Build your proprietary Audience Insight Vault. Extract, enrich, and organize B2B data with AI-powered research modules.
            </p>
          </div>

          {footerSections.map(({ title, links }) => (
            <div key={title} className="max-w-sm">
              <h6 className="font-medium">{title}</h6>
              <ul className="mt-6 space-y-4">
                {links.map(({ title, href }) => (
                  <li key={title}>
                    <Link
                      href={href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscribe Newsletter */}
          <div className="max-w-sm w-full">
            <h6 className="font-medium">Stay up to date</h6>
            <p className="mt-2 text-sm text-muted-foreground">
              Get the latest audience research strategies and updates.
            </p>
            <SubscribeForm />
          </div>
        </div>
        <Separator />
        <div className="py-8 flex items-center justify-center px-6 xl:px-0">
          <div className="flex items-center gap-4 text-muted-foreground flex-wrap justify-center">
            <Link href="https://www.linkedin.com/in/draurangzebabbas/" target="_blank" className="hover:text-foreground transition-colors">
              <IconBrandLinkedin className="h-5 w-5" />
            </Link>
            <Link href="https://www.youtube.com/@draurangzebabbas" target="_blank" className="hover:text-foreground transition-colors">
              <IconBrandYoutube className="h-5 w-5" />
            </Link>
            <Link href="https://x.com/draurangzebabas" target="_blank" className="hover:text-foreground transition-colors">
              <IconBrandX className="h-5 w-5" />
            </Link>
            <Link href="https://draurangzebabbas.com" target="_blank" className="hover:text-foreground transition-colors">
              <IconWorld className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
