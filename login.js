console.log("login.js?v=4" loaded");

import { auth, db, GoogleAuthProvider, signInWithEmailAndPassword } from "./firebase-config.js?v=4"?v=3";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js?v=4"?v=3";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js?v=4"?v=3";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js?v=4"?v=3";

// 🔄 Loading overlay
const loading = document.getElementById("loading");
function showLoading(show) {
  if (loading) loading.style.display = show ? "flex" : "none";
}

// 🔁 Toggle form login/register
function showRegister() {
  document.getElementById("loginForm")?.classList.add("hidden");
  document.getElementById("registerForm")?.classList.remove("hidden");
}
function showLogin() {
  document.getElementById("registerForm")?.classList.add("hidden");
  document.getElementById("loginForm")?.classList.remove("hidden");
}

// ✅ Register
const registerForm = document.getElementById("registerSubmit");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading(true);

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const phone = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Password tidak cocok!");
      showLoading(false);
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      showLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        phone,
        createdAt: new Date(),
      });

      await sendEmailVerification(user);
      alert("Registrasi berhasil! Silakan verifikasi email.");
      showLogin();
      registerForm.reset();
    } catch (error) {
      // alert("Gagal register: " + error.message); // Hapus alert bawaan browser
      let msg = "Gagal register: " + error.message;
      if (error.code === "auth/email-already-in-use") {
        msg = "Email sudah terdaftar. Silakan gunakan email lain.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Format email tidak valid.";
      } else if (error.code === "auth/operation-not-allowed") {
        msg = "Pendaftaran dengan email/password dinonaktifkan. Silakan coba login atau hubungi admin.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.";
      }
      // Tampilkan pesan kesalahan dengan style yang sama, tapi warna merah
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style'); // Hapus semua inline style agar hanya pakai CSS
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
      } else {
        alert(msg);
        showLoading(false);
      }
    } finally {
      showLoading(false);
    }
  });
}

// ✅ Login Email/Password
const loginForm = document.getElementById("loginSubmit");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading(true);

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // if (!user.emailVerified) {
      //   alert("Email belum diverifikasi.");
      //   await signOut(auth);
      //   showLoading(false);
      //   return;
      // }
      if (!user.emailVerified) {
        // Tampilkan popup error email belum diverifikasi
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Email belum diverifikasi. Silakan cek email Anda dan lakukan verifikasi terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // alert("Login berhasil."); // Hapus alert bawaan browser
      // Tampilkan popup sukses dengan style yang sama, tapi warna hijau dan auto hilang
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg login-success-msg';
          notif.title = '';
          loading.appendChild(notif);
        }
        notif.textContent = 'Login berhasil!';
        notif.style.display = 'block';
        notif.className = 'login-error-msg login-success-msg';
        notif.removeAttribute('style'); // Hapus semua inline style agar hanya pakai CSS
        setTimeout(() => {
          notif.style.display = 'none';
          showLoading(false);
          window.location.href = "index.html";
        }, 1200);
      } else {
        showLoading(false);
        window.location.href = "index.html";
      }
    } catch (error) {
      let msg = "Gagal login: " + error.message;
      if (error.code === "auth/user-not-found") {
        msg = "Akun tidak ditemukan.";
      } else if (error.code === "auth/wrong-password") {
        msg = "Password salah. Silakan coba lagi.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Format email tidak valid.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Akun diblokir sementara karena terlalu banyak percobaan login gagal. Silakan coba lagi nanti.";
      } else if (error.code === "auth/invalid-credential") {
        msg = "Email atau Password salah.";
      }
      // Hilangkan loading overlay HANYA jika user sudah menutup popup error
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style'); // Hapus semua inline style agar hanya pakai CSS
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
        // Jangan panggil showLoading(false) di sini!
      } else {
        alert(msg);
        showLoading(false);
      }
    }
  });
}

// ✅ Google Sign-In (POPUP FIXED & ONLY REGISTERED, VERIFIED USERS CAN LOGIN)
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    showLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = result._tokenResponse?.isNewUser;

      // Jika user baru (belum terdaftar di Firebase Auth)
      if (isNewUser) {
        // Sign out, tampilkan popup error
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Akun Google Anda belum terdaftar di Whoozer. Silakan daftar terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // Cek verifikasi email Google
      if (!user.emailVerified) {
        // Tampilkan popup error email belum diverifikasi
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Email Google Anda belum diverifikasi. Silakan cek email Anda dan lakukan verifikasi terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // Jika sudah verifikasi, tampilkan popup sukses, auto hilang, lalu redirect
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg login-success-msg';
          notif.title = '';
          loading.appendChild(notif);
        }
        notif.textContent = 'Login berhasil!';
        notif.style.display = 'block';
        notif.className = 'login-error-msg login-success-msg';
        notif.removeAttribute('style');
        setTimeout(() => {
          notif.style.display = 'none';
          showLoading(false);
          window.location.href = "index.html";
        }, 1200);
      } else {
        showLoading(false);
        window.location.href = "index.html";
      }
    } catch (error) {
      // Tampilkan error Google login dengan popup overlay
      let msg = "Login Google gagal: " + error.message;
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style');
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
      } else {
        showLoading(false);
      }
    }
  });
}

// ✅ Google Register
const googleRegisterBtn = document.getElementById("googleRegisterBtn");
if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    showLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = result._tokenResponse?.isNewUser;

      if (!isNewUser) {
        // Sudah pernah register/login
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Akun Google sudah terdaftar, silakan login. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // Cek verifikasi email Google
      if (!user.emailVerified) {
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Email Google Anda belum diverifikasi. Silakan cek email Anda dan lakukan verifikasi terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // Simpan data user baru ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: user.displayName || "",
        email: user.email,
        phone: user.phoneNumber || "",
        createdAt: new Date(),
      });

      // Tampilkan popup sukses, auto hilang, redirect
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg login-success-msg';
          notif.title = '';
          loading.appendChild(notif);
        }
        notif.textContent = 'Registrasi Google berhasil!';
        notif.style.display = 'block';
        notif.className = 'login-error-msg login-success-msg';
        notif.removeAttribute('style');
        setTimeout(() => {
          notif.style.display = 'none';
          showLoading(false);
          window.location.href = "index.html";
        }, 1200);
      } else {
        showLoading(false);
        window.location.href = "index.html";
      }
    } catch (error) {
      let msg = "Registrasi Google gagal: " + error.message;
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style');
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
      } else {
        showLoading(false);
      }
    }
  });
}

// ✅ Auto redirect if already logged in
onAuthStateChanged(auth, (user) => {
  console.log("🔄 onAuthStateChanged triggered. User:", user);
  if (user) {
    console.log("✅ User is signed in:", user);
    window.location.href = "index.html";
  }
});

// ✅ Form toggling links
document.querySelectorAll('[data-action="showRegister"]').forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showRegister();
  })
);
document.querySelectorAll('[data-action="showLogin"]').forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  })
);
