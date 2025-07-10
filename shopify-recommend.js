// Shopify Product Recommendation Example
// Ganti YOUR_SHOP_DOMAIN dan YOUR_STOREFRONT_TOKEN sesuai Shopify Storefront API
// Untuk demo publik, gunakan hanya query produk yang diizinkan

const SHOPIFY_DOMAIN = "wkuivg-vk.myshopify.com";
const STOREFRONT_TOKEN = "public-access-token"; // Ganti dengan token publik Storefront API

async function fetchShopifyProducts(limit = 3, excludeName = "") {
  const endpoint = `https://${SHOPIFY_DOMAIN}/api/2023-07/graphql.js?v=4"on`;
  const query = `{
    products(first: ${limit + 1}) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 2) {
            edges { node { url altText } }
          }
          variants(first: 1) { edges { node { id price { amount currencyCode } } } }
        }
      }
    }
  }`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.js?v=4"on();
  if (!data.data || !data.data.products) return [];
  let products = data.data.products.edges.map(e => e.node);
  if (excludeName) products = products.filter(p => p.title !== excludeName);
  return products.slice(0, limit);
}

window.loadShopifyRecommendations = async function(currentName) {
  const container = document.getElementById("recommendedProducts");
  if (!container) return;
  container.innerHTML = `<div class='skeleton-card'></div><div class='skeleton-card'></div><div class='skeleton-card'></div>`;
  try {
    const products = await fetchShopifyProducts(3, currentName);
    if (!products.length) {
      container.innerHTML = '<div style="text-align:center;color:#888;padding:2em;">Tidak ada rekomendasi produk.</div>';
      return;
    }
    container.innerHTML = products.map(prod => `
      <div class="recommended-card">
        <a href="product.html" onclick="localStorage.setItem('selectedProduct', JSON.stringify({
          name: '${prod.title.replace(/'/g, "\\'")}',
          price: ${prod.variants.edges[0].node.price.amount},
          frontImg: '${prod.images.edges[0]?.node.url || ""}',
          backImg: '${prod.images.edges[1]?.node.url || ""}',
          description: '${(prod.description || '').replace(/'/g, "\\'")}',
          variantId: '${prod.variants.edges[0].node.id}'
        }))">
          <img src="${prod.images.edges[0]?.node.url || ""}" alt="${prod.title}" class="recommended-img" loading="lazy" width="300" height="300" />
          <div class="recommended-info">
            <h4>${prod.title}</h4>
            <p class="recommended-price">Rp ${(parseFloat(prod.variants.edges[0].node.price.amount)).toLocaleString("id-ID")}</p>
          </div>
        </a>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = '<div style="color:red;">Gagal memuat rekomendasi produk Shopify.</div>';
  }
};
