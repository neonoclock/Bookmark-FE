// assets/js/core/vdom.js

// 1) VNode 생성 함수
export function h(type, props, ...children) {
  const flatChildren = children
    .flat()
    .filter((c) => c !== null && c !== false && c !== undefined);

  return {
    type,
    props: props || {},
    children: flatChildren,
  };
}

// 2) 실제 DOM으로 변환
function createElement(vnode) {
  // 텍스트 노드
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  if (!vnode || typeof vnode.type !== "string") {
    console.warn("[vdom] invalid vnode:", vnode);
    return document.createTextNode("");
  }

  const el = document.createElement(vnode.type);
  const props = vnode.props || {};

  for (const key in props) {
    const value = props[key];

    if (value === null || value === undefined || value === false) continue;

    // class -> className
    if (key === "class") {
      el.className = value;
      continue;
    }

    // data-* 모음
    if (key === "dataset" && typeof value === "object") {
      Object.assign(el.dataset, value);
      continue;
    }

    // 이벤트 핸들러: onClick, onInput, onChange ...
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase(); // Click -> click
      el.addEventListener(eventName, value);
      continue;
    }

    // value / checked 같은 property 계열
    if (key === "value" && "value" in el) {
      el.value = value;
      continue;
    }

    if (key === "checked" && "checked" in el) {
      el.checked = Boolean(value);
      continue;
    }

    if (key === "disabled" && "disabled" in el) {
      el.disabled = Boolean(value);
      continue;
    }

    // 그 외는 attribute로
    el.setAttribute(key, String(value));
  }

  // 자식들 렌더링
  (vnode.children || []).forEach((child) => {
    el.appendChild(createElement(child));
  });

  return el;
}

// 3) 컨테이너에 렌더링
export function render(vnode, container) {
  if (!container) return;

  container.innerHTML = "";

  if (Array.isArray(vnode)) {
    vnode.forEach((child) => {
      container.appendChild(createElement(child));
    });
  } else if (vnode) {
    container.appendChild(createElement(vnode));
  }
}
