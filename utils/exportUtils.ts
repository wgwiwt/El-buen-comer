import { Restaurant } from "../types";

// Helper to format price in export
const formatPrice = (price: string | number) => {
    if (typeof price === 'number') return `${price} €`;
    if (price && !price.toString().includes('€')) return `${price} €`;
    return price;
};

// Function to generate the CSS needed to match the app
const getStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --gourmet-bg: #141414;
    --gourmet-gold: #DAAB2D;
    --gourmet-text: #F7E7CE;
    --community-sage: #A9B494;
    --community-coral: #E07A5F;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background-color: #f5f5f5;
  }

  .print-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  h1.main-title {
    text-align: center;
    font-family: 'Fraunces', serif;
    font-size: 3rem;
    margin-bottom: 20px;
    color: #141414;
  }
  
  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 40px;
  }

  /* --- TABS SYSTEM --- */
  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    gap: 10px;
  }

  .tab-btn {
    padding: 12px 24px;
    border: none;
    cursor: pointer;
    font-family: 'Fraunces', serif;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
    background: #e0e0e0;
    color: #888;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .tab-btn.active.gourmet {
    background: #141414;
    color: #DAAB2D;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .tab-btn.active.community {
    background: #A9B494;
    color: white;
    box-shadow: 0 4px 12px rgba(169, 180, 148, 0.4);
  }

  .tab-content {
    display: none;
    animation: fadeEffect 0.5s;
  }

  @keyframes fadeEffect {
    from {opacity: 0;}
    to {opacity: 1;}
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  /* --- GOURMET CARD STYLES --- */
  .card-gourmet {
    background-color: #141414;
    color: var(--gourmet-text);
    padding: 30px;
    position: relative;
    border: 1px solid rgba(218, 171, 45, 0.2);
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    border-radius: 16px; /* Rounded corners for elegance */
    overflow: hidden;
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.3);
  }

  .card-gourmet::after {
    content: '';
    position: absolute;
    top: 6px; left: 6px; right: 6px; bottom: 6px;
    border: 1px solid rgba(218, 171, 45, 0.15);
    pointer-events: none;
    border-radius: 12px; /* Inner border radius matches outer */
  }

  .g-category {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--gourmet-gold);
    display: block;
    text-align: center;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(218, 171, 45, 0.3);
    padding-bottom: 4px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }

  .g-title {
    font-family: 'Fraunces', serif;
    font-size: 1.8rem;
    text-align: center;
    margin: 0 0 15px 0;
    color: var(--gourmet-text);
    line-height: 1.2;
  }

  .g-separator {
    width: 30px;
    height: 1px;
    background: var(--gourmet-gold);
    margin: 0 auto 20px auto;
    opacity: 0.5;
  }

  .g-description {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 0.95rem;
    color: #999;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 25px;
    flex-grow: 1;
  }

  .g-details-box {
    background: rgba(255,255,255,0.05);
    padding: 15px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    border-radius: 8px; /* Slightly rounded inner box */
  }

  .g-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gourmet-gold);
    margin: 0 0 4px 0;
  }

  .g-value {
    font-size: 14px;
    margin: 0;
  }
  
  .g-price {
    font-family: 'Fraunces', serif;
    font-style: italic;
  }

  .g-footer {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 15px;
    margin-top: auto;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    text-align: center;
  }

  .g-address {
    color: #888;
    margin-bottom: 8px;
    display: block;
    font-style: italic;
    text-transform: none;
    font-size: 11px;
  }

  .g-link {
    color: var(--gourmet-gold);
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
  }

  /* --- COMMUNITY CARD STYLES --- */
  .card-community {
    background-color: #fff;
    border-radius: 16px; /* Rounded corners */
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }

  .c-bar {
    height: 6px;
    width: 100%;
    background: linear-gradient(90deg, #A9B494, #E07A5F);
  }

  .c-body {
    padding: 24px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .c-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .c-title {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: #111;
    margin: 0;
    line-height: 1.2;
  }

  .c-category {
    font-size: 11px;
    font-weight: 500;
    color: #888;
    text-transform: uppercase;
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 5px;
    display: inline-block;
  }

  .c-rating {
    background: #333;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .c-line {
    height: 1px;
    background: #f0f0f0;
    margin-bottom: 15px;
  }

  .c-description {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
    margin-bottom: 20px;
    flex-grow: 1;
  }

  .c-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .c-box {
    padding: 10px;
    border-radius: 8px;
  }

  .c-box.dish { background: rgba(169, 180, 148, 0.15); }
  .c-box.price { background: #FFF5F0; text-align: right; }

  .c-box-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
    opacity: 0.6;
  }

  .c-box-val {
    font-size: 13px;
    font-weight: 600;
    color: #222;
  }

  .c-footer {
    display: flex;
    flex-direction: column;
    margin-top: auto;
    font-size: 12px;
    color: #888;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
  }

  .c-address {
    font-size: 11px;
    color: #666;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .c-bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .c-link {
    background: white;
    border: 1px solid #A9B494;
    color: #A9B494;
    text-decoration: none;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 11px;
  }
`;

const generateGourmetCard = (r: Restaurant) => `
  <div class="card-gourmet">
    <span class="g-category">${r.awards || r.category || 'Alta Cocina'}</span>
    <h3 class="g-title">${r.name}</h3>
    <div class="g-separator"></div>
    <div class="g-description">"${r.description}"</div>
    
    <div class="g-details-box">
      <div>
        <p class="g-label">Especialidad</p>
        <p class="g-value">${r.signatureDish}</p>
      </div>
      <div style="text-align: right;">
        <p class="g-label">Precio</p>
        <p class="g-value g-price">${formatPrice(r.price)}</p>
      </div>
    </div>

    <div class="g-footer">
      <span class="g-address">${r.address || 'Ubicación disponible en mapa'}</span>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>${r.ambiance}</span>
        <a href="${r.googleMapsUrl}" target="_blank" class="g-link">VER MAPA</a>
      </div>
    </div>
  </div>
`;

const generateCommunityCard = (r: Restaurant) => `
  <div class="card-community">
    <div class="c-bar"></div>
    <div class="c-body">
      <div class="c-header">
        <div>
          <h3 class="c-title">${r.name}</h3>
          <span class="c-category">${r.category || 'Casual'}</span>
        </div>
        <div class="c-rating">★ ${r.rating}</div>
      </div>
      
      <div class="c-line"></div>
      
      <div class="c-description">${r.description}</div>
      
      <div class="c-grid">
        <div class="c-box dish">
          <span class="c-box-label">Recomendado</span>
          <span class="c-box-val">${r.signatureDish}</span>
        </div>
        <div class="c-box price">
          <span class="c-box-label">Precio Medio</span>
          <span class="c-box-val">${formatPrice(r.price)}</span>
        </div>
      </div>

      <div class="c-footer">
        <div class="c-address">
           📍 ${r.address || 'Ver ubicación en mapa'}
        </div>
        <div class="c-bottom-row">
          <span>${r.ambiance}</span>
          <a href="${r.googleMapsUrl}" target="_blank" class="c-link">Ir ahora</a>
        </div>
      </div>
    </div>
  </div>
`;

export const generateMobileGuideHTML = (
  gourmetList: Restaurant[],
  communityList: Restaurant[],
  location: string
): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guía Gastronómica: ${location}</title>
  <style>
    ${getStyles()}
  </style>
</head>
<body>

  <div class="print-container">
    <h1 class="main-title">Guía de ${location}</h1>
    <p class="subtitle">Descubre las mejores opciones gastronómicas seleccionadas para ti.</p>

    <!-- TAB NAVIGATION -->
    <div class="tabs">
      <button class="tab-btn active gourmet" onclick="openTab(event, 'Gourmet')">Gourmet</button>
      <button class="tab-btn community" onclick="openTab(event, 'Community')">Comunidad</button>
    </div>

    <!-- GOURMET CONTENT -->
    <div id="Gourmet" class="tab-content" style="display: block;">
      <div class="grid">
        ${gourmetList.length > 0 
          ? gourmetList.map(generateGourmetCard).join('') 
          : '<p style="text-align:center; color:#999;">Sin resultados disponibles.</p>'}
      </div>
    </div>

    <!-- COMMUNITY CONTENT -->
    <div id="Community" class="tab-content">
      <div class="grid">
        ${communityList.length > 0 
          ? communityList.map(generateCommunityCard).join('') 
          : '<p style="text-align:center; color:#999;">Sin resultados disponibles.</p>'}
      </div>
    </div>
    
    <div style="text-align:center; margin-top:50px; font-size:12px; color:#aaa; font-family:'Inter',sans-serif;">
      Generado por El Buen Comer
    </div>
  </div>

  <script>
    function openTab(evt, tabName) {
      // Hide all tab content
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tab-content");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      // Remove active class from all buttons
      tablinks = document.getElementsByClassName("tab-btn");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show current tab and add active class to button
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }
  </script>

</body>
</html>
  `;
};