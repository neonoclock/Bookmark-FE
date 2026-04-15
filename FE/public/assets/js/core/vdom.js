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

function createElement(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  if (!vnode || typeof vnode.type !== "string") {
    console.warn("[vdom] invalid vnode:", vnode);
    return document.createTextNode("");
  }

  const el = document.createElement(vnode.type);

  for (const key in vnode.props || {}) {
    setProp(el, key, vnode.props[key], null);
  }

  (vnode.children || []).forEach((child) => {
    el.appendChild(createElement(child));
  });

  return el;
}

function setProp(el, key, value, oldValue) {
  if (value === null || value === undefined || value === false) {
    removeProp(el, key, oldValue);
    return;
  }

  if (key === "class") {
    el.className = value;
    return;
  }

  if (key === "dataset" && typeof value === "object") {
    if (typeof oldValue === "object") {
      for (const k in oldValue) {
        if (!(k in value)) delete el.dataset[k];
      }
    }
    Object.assign(el.dataset, value);
    return;
  }

  if (key.startsWith("on") && typeof value === "function") {
    const event = key.slice(2).toLowerCase();
    if (typeof oldValue === "function") {
      el.removeEventListener(event, oldValue);
    }
    el.addEventListener(event, value);
    return;
  }

  if (key === "value" && "value" in el) {
    if (el.value !== String(value)) el.value = value;
    return;
  }

  if (key === "checked" && "checked" in el) {
    el.checked = Boolean(value);
    return;
  }

  if (key === "disabled" && "disabled" in el) {
    el.disabled = Boolean(value);
    return;
  }

  el.setAttribute(key, String(value));
}

function removeProp(el, key, oldValue) {
  if (key === "class") {
    el.className = "";
    return;
  }

  if (key.startsWith("on") && typeof oldValue === "function") {
    el.removeEventListener(key.slice(2).toLowerCase(), oldValue);
    return;
  }

  if (key === "value" && "value" in el) {
    el.value = "";
    return;
  }

  if (key === "checked" && "checked" in el) {
    el.checked = false;
    return;
  }

  if (key === "disabled" && "disabled" in el) {
    el.disabled = false;
    return;
  }

  el.removeAttribute(key);
}

function patchProps(el, oldProps, newProps) {
  for (const key in oldProps) {
    if (!(key in newProps)) {
      removeProp(el, key, oldProps[key]);
    }
  }

  for (const key in newProps) {
    const newVal = newProps[key];
    const oldVal = oldProps[key];

    if (key.startsWith("on")) {
      setProp(el, key, newVal, oldVal);
      continue;
    }

    if (newVal !== oldVal) {
      setProp(el, key, newVal, oldVal);
    }
  }
}

function patchNode(parent, oldVNode, newVNode, index) {
  const oldDom = parent.childNodes[index];

  if (oldVNode == null && newVNode == null) return;

  if (oldVNode == null) {
    if (newVNode != null) parent.appendChild(createElement(newVNode));
    return;
  }

  if (newVNode == null) {
    if (oldDom) parent.removeChild(oldDom);
    return;
  }

  const isOldText = typeof oldVNode !== "object";
  const isNewText = typeof newVNode !== "object";

  // 텍스트 노드
  if (isOldText || isNewText) {
    if (isOldText && isNewText) {
      if (String(oldVNode) !== String(newVNode) && oldDom) {
        parent.replaceChild(document.createTextNode(String(newVNode)), oldDom);
      }
    } else {
      if (oldDom) parent.replaceChild(createElement(newVNode), oldDom);
      else parent.appendChild(createElement(newVNode));
    }
    return;
  }

  if (oldVNode.type !== newVNode.type) {
    if (oldDom) parent.replaceChild(createElement(newVNode), oldDom);
    else parent.appendChild(createElement(newVNode));
    return;
  }

  if (!oldDom) {
    parent.appendChild(createElement(newVNode));
    return;
  }

  patchProps(oldDom, oldVNode.props || {}, newVNode.props || {});
  patchChildren(oldDom, oldVNode.children || [], newVNode.children || []);
}

function patchChildren(parent, oldCh, newCh) {
  const hasKeys = newCh.some(
    (c) => c && typeof c === "object" && c.props?.key != null,
  );

  if (hasKeys) {
    patchKeyedChildren(parent, oldCh, newCh);
  } else {
    patchIndexedChildren(parent, oldCh, newCh);
  }
}

function patchIndexedChildren(parent, oldCh, newCh) {
  const commonLen = Math.min(oldCh.length, newCh.length);

  for (let i = 0; i < commonLen; i++) {
    patchNode(parent, oldCh[i], newCh[i], i);
  }

  for (let i = oldCh.length - 1; i >= commonLen; i--) {
    const dom = parent.childNodes[i];
    if (dom) parent.removeChild(dom);
  }

  for (let i = commonLen; i < newCh.length; i++) {
    if (newCh[i] != null) parent.appendChild(createElement(newCh[i]));
  }
}

function patchKeyedChildren(parent, oldCh, newCh) {
  const oldMap = new Map();
  oldCh.forEach((child, i) => {
    const key = child?.props?.key;
    if (key != null) {
      oldMap.set(key, { vnode: child, dom: parent.childNodes[i] });
    }
  });

  const newDoms = newCh.map((newChild) => {
    const key = newChild?.props?.key;

    if (key != null && oldMap.has(key)) {
      const { vnode: oldChild, dom: oldDom } = oldMap.get(key);
      patchProps(oldDom, oldChild.props || {}, newChild.props || {});
      patchChildren(oldDom, oldChild.children || [], newChild.children || []);
      oldMap.delete(key);
      return oldDom;
    }

    return createElement(newChild);
  });

  // 재사용되지 않은 old 노드 제거
  oldMap.forEach(({ dom }) => parent.removeChild(dom));

  // new 순서대로 DOM 재배치 (insertBefore 기반)
  newDoms.forEach((dom, i) => {
    const current = parent.childNodes[i];
    if (current !== dom) {
      parent.insertBefore(dom, current ?? null);
    }
  });
}

export function render(vnode, container) {
  if (!container) return;

  const isFirstRender = !("_vdom" in container);

  if (isFirstRender) {
    container.innerHTML = "";
    if (Array.isArray(vnode)) {
      vnode.forEach((child) => container.appendChild(createElement(child)));
    } else if (vnode) {
      container.appendChild(createElement(vnode));
    }
  } else {
    const prev = container._vdom;
    const oldList = Array.isArray(prev) ? prev : [prev];
    const newList = Array.isArray(vnode) ? vnode : [vnode];
    patchIndexedChildren(container, oldList, newList);
  }

  container._vdom = vnode;
}
