// Ad banner — persistent on every page.
// Swap the creative by changing AD_IMAGE_SRC (place the file in /public).
const AD_IMAGE_SRC = '/leader.jpg'
const AD_HREF = 'https://firelign.com'
const AD_ALT = 'Firelign — Fire inspection software. Start your free trial.'

export default function AdBanner() {
  return (
    <div className="ad-banner-wrap">
      <span className="ad-label">Sponsored</span>
      <a
        className="ad-banner"
        href={AD_HREF}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={AD_IMAGE_SRC} alt={AD_ALT} />
      </a>
    </div>
  )
}
