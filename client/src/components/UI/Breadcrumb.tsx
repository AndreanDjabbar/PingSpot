    "use client";

    import Link from "next/link";
    import { HiChevronRight } from "react-icons/hi";

    interface BreadcrumbProps {
        path: string;
    }

    const paths = [
        { id: 'home', label: '🏠 Dashboard',},
        { id: 'map', label: 'Peta Interaktif', },
        { id: 'reports', label: 'Laporan Saya', },
        { id: 'community', label: 'Komunitas', },
        { id: 'messages', label: 'Pesan', },
        { id: 'activity', label: 'Aktivitas', },
        { id: 'settings', label: '⚙️ Pengaturan', },
        { id: 'help', label: 'Bantuan' },
        { id: 'profile', label: 'Profil' },
        { id: 'security', label: 'Keamanan' },
    ]

    const Breadcrumb = ({ path }: BreadcrumbProps) => {
        const parts = path.split("/").filter(Boolean);
        const items = parts.slice(1).map((part, idx) => {
            return {
            label: part.charAt(0) + part.slice(1),
            href:
                "/" +
                parts
                .slice(1, idx + 2)
                .join("/"),
            };
        });
        const parentPath = parts.length > 1 ? parts[0] : 'home';

        return (
            <nav
            className="flex items-center text-3xl text-gray-600"
            aria-label="Breadcrumb"
            >
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center">
                {idx > 0 && (
                    <HiChevronRight 
                    className="mx-2 text-gray-400"
                    size={30} />
                )}
                {idx < items.length - 1 ? (
                    <>
                        {console.log("item: ", item)}
                        <Link
                        href={`/${parentPath}/${item.href}`}
                        className="hover:text-sky-800 transition-colors"
                        >
                            {paths.find((p) => p.id === item.label)?.label ?? item.label}
                        </Link>
                    </>
                ) : (
                    <span className="text-gray-900 font-medium">
                        {paths.find((p) => p.id === item.label)?.label ?? item.label}
                    </span>
                )}
                </div>
            ))}
            </nav>
        );
    };

    export default Breadcrumb;
