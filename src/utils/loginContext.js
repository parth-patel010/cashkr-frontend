const LOGIN_CONTEXT_KEY = 'devicekart_login_context';

export function setLoginContext(ctx) {
  try {
    sessionStorage.setItem(LOGIN_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    // ignore storage errors
  }
}

export function getLoginContext() {
  try {
    const raw = sessionStorage.getItem(LOGIN_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLoginContext() {
  try {
    sessionStorage.removeItem(LOGIN_CONTEXT_KEY);
  } catch {
    // ignore storage errors
  }
}
