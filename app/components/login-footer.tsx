import Link from "next/link"

const footerLinks = [
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Contact Giteria", href: "#" },
  { label: "Manage cookies", href: "#" },
  { label: "Do not share my personal information", href: "#" },
]

export function LoginFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-10">
      {footerLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="text-xs text-[#2f81f7] hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </footer>
  )
}
