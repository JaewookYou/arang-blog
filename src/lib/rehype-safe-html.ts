import { toHtml } from "hast-util-to-html";
import type { Root, Element, ElementContent, RootContent } from "hast";

/**
 * 렌더링된 HTML에서 실행될 수 있는 요소를 무력화하는 rehype 플러그인
 * (velite.config.ts에서도 import하므로 경로 별칭(@/)을 쓰지 않는다)
 *
 * 티스토리에서 옮겨온 글에는 예시 페이로드가 코드 블록 밖에 원시 HTML로 남아 있다.
 * 예: <script>document.location.href='...'</script>
 * 본문을 서버에서 그대로 렌더링하면 이런 스크립트가 방문자 브라우저에서 실행되므로,
 * - script/noscript/style 등은 실행하지 않고 원래 HTML을 코드 텍스트로 보여주고
 * - on* 이벤트 속성과 javascript: 주소는 제거한다.
 */

const NEUTRALIZE = new Set([
    "script", "noscript", "style", "template", "object", "embed",
    "base", "meta", "link", "frame", "frameset", "applet",
]);
const URL_PROPERTIES = ["href", "src", "action", "formAction", "xLinkHref", "poster", "data", "background", "cite", "srcSet"];
const DANGEROUS_URL = /^[\s\u0000-\u001f]*(javascript|vbscript|livescript)\s*:|^[\s\u0000-\u001f]*data\s*:\s*text\/html/i;

function neutralize(node: Element, blockLevel: boolean): Element {
    const code: Element = {
        type: "element",
        tagName: "code",
        properties: { className: ["unsafe-html"] },
        children: [{ type: "text", value: toHtml(node) }],
    };
    return blockLevel ? { type: "element", tagName: "pre", properties: {}, children: [code] } : code;
}

function clean(node: Element) {
    const props = node.properties || {};
    for (const key of Object.keys(props)) {
        if (/^on/i.test(key) || key === "srcDoc") {
            delete props[key];
            continue;
        }
        if (URL_PROPERTIES.includes(key)) {
            const value = Array.isArray(props[key]) ? (props[key] as unknown[]).join(" ") : String(props[key] ?? "");
            if (DANGEROUS_URL.test(value)) delete props[key];
        }
    }
}

function walk(parent: Root | Element) {
    const blockLevel = parent.type === "root";
    parent.children = parent.children.map((child) => {
        if (child.type !== "element") return child;
        if (NEUTRALIZE.has(child.tagName)) return neutralize(child, blockLevel);
        clean(child);
        // <template>의 내용은 content에 들어 있으므로 따로 볼 필요 없음 (위에서 통째로 무력화)
        walk(child);
        return child;
    }) as (RootContent & ElementContent)[];
}

export function rehypeSafeHtml() {
    return (tree: Root) => {
        walk(tree);
    };
}
