"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

/**
 * MDEditor(textarea)의 커서 위치에 마크다운을 삽입한다.
 * 예전에는 툴바 버튼과 이미지 붙여넣기가 항상 문서 맨 끝에 덧붙여졌다.
 *
 * 이미지 업로드처럼 비동기로 끝나는 삽입도 있으므로, 호출 시점의 최신 내용을
 * textarea에서 직접 읽는다. (업로드 중에 입력한 글자가 사라지지 않도록)
 */
export function useMarkdownInsert(
    containerRef: RefObject<HTMLElement | null>,
    value: string,
    setValue: (next: string) => void
) {
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    return useCallback(
        (before: string, after = "", placeholder = "") => {
            const textarea = containerRef.current?.querySelector("textarea");
            const current = textarea ? textarea.value : valueRef.current;
            if (!textarea) {
                const next = current + before + placeholder + after;
                valueRef.current = next;
                setValue(next);
                return;
            }
            const start = textarea.selectionStart ?? current.length;
            const end = textarea.selectionEnd ?? current.length;
            const selected = current.slice(start, end) || placeholder;
            const next = current.slice(0, start) + before + selected + after + current.slice(end);
            valueRef.current = next;
            setValue(next);

            // 상태 반영 후 선택 영역 복원
            requestAnimationFrame(() => {
                textarea.focus();
                const selStart = start + before.length;
                textarea.setSelectionRange(selStart, selStart + selected.length);
            });
        },
        [containerRef, setValue]
    );
}
