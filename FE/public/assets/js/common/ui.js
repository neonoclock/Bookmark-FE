import { $ } from "../core/dom.js";
import { clearAuth } from "../core/storage.js";
import { UsersAPI } from "../api/users.js";

export async function loadMyAvatar(logPrefix = "") {
  const avatarBtn = $("#avatarBtn");
  if (!avatarBtn) return;

  avatarBtn.dataset.loggedIn = "false";
  avatarBtn.classList.remove("has-avatar");
  avatarBtn.style.removeProperty("--avatar-url");
  if (!avatarBtn.textContent) {
    avatarBtn.textContent = "👩🏻‍💻";
  }

  try {
    const user = await UsersAPI.getMe();

    const prefix = logPrefix ? ` ${logPrefix}` : "";
    console.log(`[AVATAR${prefix}] normalized user:`, user);

    const profileImage = user.profileImage;

    if (!profileImage) {
      console.log(`[AVATAR${prefix}] profileImage 없음, 기본 아바타 사용`);
      return;
    }

    avatarBtn.style.setProperty("--avatar-url", `url(${profileImage})`);
    avatarBtn.classList.add("has-avatar");
    avatarBtn.textContent = "";
    avatarBtn.dataset.loggedIn = "true";

    console.log(`[AVATAR${prefix}] 프로필 이미지 적용 완료:`, profileImage);
  } catch (err) {
    const prefix = logPrefix ? ` ${logPrefix}` : "";
    console.error(`[AVATAR${prefix}] 내 프로필(아바타) 불러오기 실패:`, err);

    avatarBtn.dataset.loggedIn = "false";
    avatarBtn.classList.remove("has-avatar");
    avatarBtn.style.removeProperty("--avatar-url");
    if (!avatarBtn.textContent) {
      avatarBtn.textContent = "👩🏻‍💻";
    }
  }
}

export function setupAvatarMenu() {
  const wrap = $("#avatarWrap");
  const btn = $("#avatarBtn");
  const menu = $("#avatarMenu");
  const logoutBtn = $(".menu-logout");

  if (!wrap || !btn || !menu) return;

  function closeMenu() {
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const isLoggedIn = btn.dataset.loggedIn === "true";
    if (!isLoggedIn) {
      window.location.href = "./login.html";
      return;
    }

    const isOpen = wrap.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!confirm("로그아웃 하시겠습니까?")) return;
      clearAuth();
      window.location.href = "./login.html";
    });
  }
}
