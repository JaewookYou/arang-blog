import Script from "next/script";

/**
 * Naver Analytics Component
 * 네이버 애널리틱스 트래킹 스크립트
 */

const NAVER_ANALYTICS_ID = "s_5f5e29e13a8d";

export function NaverAnalytics() {
    return (
        <>
            <Script
                src="https://wcs.naver.net/wcslog.js"
                strategy="afterInteractive"
            />
            <Script id="naver-analytics" strategy="afterInteractive">
                {`
                    if (!window.wcs_add) { window.wcs_add = {}; }
                    wcs_add["wa"] = "${NAVER_ANALYTICS_ID}";
                    if (typeof wcs !== "undefined" && wcs.inflow) {
                        wcs.inflow("blog.arang.kr");
                        wcs_do();
                    }
                `}
            </Script>
        </>
    );
}
