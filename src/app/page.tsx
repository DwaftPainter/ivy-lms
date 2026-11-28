import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "@/lib/seo";

export const metadata: Metadata = {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    alternates: {
        canonical: "/"
    }
};

const IndexPage = () => {
    return <div>page</div>;
};

export default IndexPage;
