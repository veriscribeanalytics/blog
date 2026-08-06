import { announcement } from "@/lib/data";

/** Thin cream strip pinned above the header — site-wide tagline. */
export default function AnnouncementBar() {
  return (
    <div className="bg-band border-b border-line">
      <div className="mx-auto max-w-page px-5 lg:px-8">
        <p className="text-center text-tiny text-body py-2 tracking-wide">
          {announcement}
        </p>
      </div>
    </div>
  );
}
