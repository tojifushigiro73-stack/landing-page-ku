export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-content">
        <h1>Kue rumahan<br /><span className="accent-text"> Rasa Premium</span></h1>
        <p>Pilihan kue rumahan terbaik di Kota Metro. Dibuat dengan cinta setiap hari untuk Anda.</p>
        <a href="#menu" className="cta-btn">Pesan Sekarang</a>
        <a 
          href="https://wa.me/6285836695103?text=Halo%20La%20Misha,%20saya%20mau%20tanya-tanya%20dulu%20dong%20seputar%20kue-nya..."
          target="_blank" 
          className="cta-btn wa-hero-btn"
          rel="noreferrer"
        >
          <i className="fa-brands fa-whatsapp"></i> Tanya via WhatsApp
        </a>
      </div>
    </section>
  );
}
