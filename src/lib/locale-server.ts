import { cookies } from "next/headers";
import { normalizeLocale, type Locale } from "@/lib/i18n";

/**
 * 현재 요청의 언어를 반환한다.
 * middleware가 ?lang= 파라미터와 브라우저 언어를 반영해 locale 쿠키를 맞춰 두므로
 * 서버 컴포넌트에서는 쿠키만 읽으면 된다.
 */
export async function getRequestLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    return normalizeLocale(cookieStore.get("locale")?.value);
}
