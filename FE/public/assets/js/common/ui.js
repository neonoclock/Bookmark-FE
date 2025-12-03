import { $ } from "../core/dom.js";
import { loadAuth, saveAuth, clearAuth } from "../core/storage.js";
import { UsersAPI } from "../api/users.js";

function setGuestAvatar(avatarBtn) {
  if (!avatarBtn) return;

  avatarBtn.dataset.loggedIn = "false";
  avatarBtn.classList.remove("has-avatar");
  avatarBtn.style.removeProperty("--avatar-url");

  if (!avatarBtn.textContent) {
    avatarBtn.textContent = "👩🏻‍💻";
  }
}

export async function loadMyAvatar(logPrefix = "") {
  const avatarBtn = $("#avatarBtn");
  if (!avatarBtn) return;

  setGuestAvatar(avatarBtn);

  const prefix = logPrefix ? ` ${logPrefix}` : "";

  try {
    const me = await UsersAPI.getMe();
    const auth = loadAuth();

    console.log(`[AVATAR${prefix}] /me:`, me, "auth:", auth);

    const userIdFromMe = me?.userId ?? me?.id ?? me?.user_id ?? null;
    const userIdFromAuth = auth?.id ?? null;

    if (!userIdFromMe && !userIdFromAuth) {
      console.log(`[AVATAR${prefix}] 로그인 유저 없음 → 게스트 아바타 유지`);
      return;
    }

    avatarBtn.dataset.loggedIn = "true";

    const merged = {
      id: userIdFromMe ?? userIdFromAuth,
      email: me?.email ?? auth?.email ?? null,
      nickname: me?.nickname ?? auth?.nickname ?? null,
      profileImage:
        me?.profileImage ??
        me?.profile_image ??
        auth?.profileImage ??
        auth?.profile_image ??
        null,
      role: me?.role ?? me?.user_role ?? auth?.role ?? null,
    };

    saveAuth(merged);

    const profileImage = merged.profileImage;

    if (!profileImage) {
      console.log(
        `[AVATAR${prefix}] profileImage 없음 → 기본 아바타 사용 (로그인 상태)`
      );
      return;
    }

    avatarBtn.style.setProperty("--avatar-url", `url(${profileImage})`);
    avatarBtn.classList.add("has-avatar");
    avatarBtn.textContent = "";

    console.log(
      `[AVATAR${prefix}] 프로필 이미지 적용 완료 (len=${profileImage.length})`
    );
  } catch (err) {
    console.error(`[AVATAR${prefix}] 내 프로필(아바타) 불러오기 실패:`, err);
    setGuestAvatar(avatarBtn);
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

  btn.addEventListener("click", async (e) => {
    e.stopPropagation();

    let isLoggedIn = btn.dataset.loggedIn === "true";

    if (!isLoggedIn) {
      try {
        const me = await UsersAPI.getMe();
        const userId = me?.userId ?? me?.id ?? me?.user_id ?? null;

        if (!userId) {
          window.location.href = "./login.html";
          return;
        }

        btn.dataset.loggedIn = "true";
        isLoggedIn = true;
      } catch (err) {
        console.warn("[AVATAR] /me 재확인 실패 → 로그인 페이지로 이동", err);
        window.location.href = "./login.html";
        return;
      }
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
