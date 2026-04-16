document.addEventListener("DOMContentLoaded", function () {
  
  /* --- 1. SISTEM ANIMASI REVEAL (LENGKAP) --- */
  // Mengatur animasi elemen saat di-scroll
  const revealElements = () => {
    const observerOptions = {
      threshold: 0.1, 
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          // Hapus baris di bawah jika ingin animasi hanya sekali saja
          entry.target.classList.remove("active");
        }
      });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-flip, .reveal-down, .reveal-zoom, .reveal-fade"
    );
    
    hiddenElements.forEach((el) => observer.observe(el));
  };

  revealElements();


  /* --- 2. LOGIKA HALAMAN ORDER (DENGAN PERSISTENSI DATA) --- */
  const laundryForm = document.getElementById("laundryForm");
  const tabelBody = document.getElementById("tabelBody");
  const btnHapusSemua = document.getElementById("btnHapusSemua");
  const totalDisplay = document.getElementById("totalPesanan");

  /**
   * FUNGSI A: Memuat Data dari LocalStorage (Anti-Reset)
   */
  const loadLaundryData = () => {
    // Mengambil data dari memori browser
    const storedData = JSON.parse(localStorage.getItem("ramaLaundryData")) || [];
    
    if (tabelBody) {
      tabelBody.innerHTML = ""; // Bersihkan tabel sebelum render ulang
      
      storedData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="ps-4">${index + 1}</td>
          <td><span class="fw-bold">${item.nama}</span><br><small class="text-muted">0${item.wa}</small></td>
          <td>${item.layanan}</td>
          <td>${item.berat} kg</td>
          <td>${item.metode}</td>
          <td class="fw-bold text-primary">Rp ${parseInt(item.harga).toLocaleString('id-ID')}</td>
          <td><span class="badge bg-primary-subtle text-primary border border-primary px-3">${item.status}</span></td>
          <td><button type="button" class="btn btn-sm btn-outline-danger btn-hapus" data-index="${index}"><i class="bi bi-trash"></i></button></td>
        `;
        tabelBody.appendChild(row);
      });
    }
    
    // Update counter total di bawah tabel
    if (totalDisplay) {
      totalDisplay.innerText = storedData.length;
    }
  };

  /**
   * FUNGSI B: Menangani Input Pesanan Baru
   */
  if (laundryForm && tabelBody) {
    
    laundryForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Menangkap Data Input
      const nama = laundryForm.querySelector('input[type="text"]').value;
      const waRaw = laundryForm.querySelector('input[type="number"]').value;
      const layanan = document.getElementById("pilihLayanan").value;
      const beratInput = document.getElementById("beratInput").value || 0;
      const metode = laundryForm.querySelectorAll('select')[1].value;

      // SINKRONISASI HARGA DENGAN TABEL PAKET
      let hargaUnit = 0;
      if (layanan === "Cuci Only") {
        hargaUnit = 6000;
      } else if (layanan === "Cuci + Setrika") {
        hargaUnit = 9000;
      } else if (layanan === "Express") {
        hargaUnit = 15000;
      }

      // LOGIKA MINIMAL ORDER 2KG (Sesuai Ketentuan Tabel)
      let beratHitung = parseFloat(beratInput);
      if (beratHitung > 0 && beratHitung < 2) {
        beratHitung = 2; // Paksa hitung 2kg jika di bawah minimal
        alert("Info: Minimal order 2kg, harga akan disesuaikan.");
      }

      const totalHarga = beratHitung * hargaUnit;

      // Membuat Objek Data
      const newOrder = {
        nama: nama,
        wa: waRaw,
        layanan: layanan,
        berat: beratHitung,
        metode: metode,
        harga: totalHarga,
        status: "Proses"
      };

      // Simpan ke Array di LocalStorage
      const currentData = JSON.parse(localStorage.getItem("ramaLaundryData")) || [];
      currentData.push(newOrder);
      localStorage.setItem("ramaLaundryData", JSON.stringify(currentData));

      // Reset Form UI & Refresh Tabel
      laundryForm.reset();
      loadLaundryData();
    });

    /**
     * FUNGSI C: Hapus Pesanan Satuan
     */
    tabelBody.addEventListener("click", function (e) {
      const deleteBtn = e.target.closest(".btn-hapus");
      if (deleteBtn) {
        if (confirm("Hapus pesanan ini dari daftar?")) {
          const index = deleteBtn.getAttribute("data-index");
          let currentData = JSON.parse(localStorage.getItem("ramaLaundryData")) || [];
          
          currentData.splice(index, 1); // Buang data berdasarkan urutan
          localStorage.setItem("ramaLaundryData", JSON.stringify(currentData));
          
          loadLaundryData(); // Render ulang tabel
        }
      }
    });

    /**
     * FUNGSI D: Hapus Seluruh Data
     */
    if (btnHapusSemua) {
      btnHapusSemua.addEventListener("click", function () {
        if (confirm("PERINGATAN: Hapus seluruh daftar pesanan secara permanen?")) {
          localStorage.removeItem("ramaLaundryData");
          loadLaundryData();
        }
      });
    }

    // Jalankan pemuatan data saat halaman pertama kali dibuka
    loadLaundryData();
  }
});