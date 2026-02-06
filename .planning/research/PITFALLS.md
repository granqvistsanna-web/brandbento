# Domain Pitfalls: Client-Side Brand Extraction and Canvas-Based Experimentation

**Domain:** Brand extraction and visual experimentation tools
**Researched:** 2026-02-06
**Confidence:** MEDIUM-HIGH (WebSearch verified with technical sources, some findings from established best practices)

## Critical Pitfalls

Mistakes that cause rewrites, major performance issues, or complete feature failures.

### Pitfall 1: CORS Proxy Abuse and Rate Limiting

**What goes wrong:** Public CORS proxies get hammered by abuse, leading to strict rate limits, downtime, or complete shutdown. Your entire extraction feature becomes unreliable or stops working.

**Why it happens:** CORS proxies are required for client-side URL fetching, but free/public proxies attract malicious traffic. Without controls, a single user can trigger hundreds of requests, exhausting quotas or getting your proxy blacklisted.

**Consequences:**
- Extraction fails intermittently or completely
- Users blame your app, not the proxy
- Migration to paid service or self-hosted solution becomes emergency work
- No fallback strategy means broken core feature

**Prevention:**
1. **Self-host from day one** — Deploy your own Cloudflare Worker proxy rather than relying on third-party services. "If you want to use a CORS proxy, don't use somebody else's CORS proxy. The CORS proxy can read and do anything with the full request & response."
2. **Domain allowlist** — Restrict proxy to allowlist of domains (if scope permits) or implement request signature verification
3. **Rate limiting** — Implement IP-based rate limiting (e.g., 10 requests per minute per IP). Link rate limit to request source IP to prevent individual users sending hundreds of requests per second.
4. **Geographic restrictions** — Block countries with high suspicious request volume if analytics show abuse patterns
5. **Content type filtering** — Block non-text content types (only allow HTML, CSS, JSON, XML) to prevent binary file abuse
6. **Response size limits** — Cap response payload size to prevent bandwidth exhaustion
7. **CORS header handling** — Use Cloudflare Transformations to add CORS headers on 429 rate limit responses so users get proper error messages

**Detection:**
- Sudden spike in proxy requests from single IP
- Error rates above 5% on extraction attempts
- Proxy response times exceeding 5 seconds
- 429 rate limit errors in browser console

**Phase mapping:** Foundation phase (proxy setup) and Post-MVP monitoring phase

**Sources:**
- [What are CORS proxies, and when are they safe?](https://httptoolkit.com/blog/cors-proxies/) — MEDIUM confidence
- [CORS on rate limit 429 - Cloudflare Community](https://community.cloudflare.com/t/cors-on-rate-limit-429/270010) — MEDIUM confidence
- [CORS policy best practices](https://www.contentstack.com/blog/all-about-headless/implementing-cors-policy-best-practices-to-prevent-common-cors-errors) — MEDIUM confidence

---

### Pitfall 2: URL State Exceeds Browser Limits

**What goes wrong:** Canvas state encoded in URL grows beyond browser limits (2,000-65,000 characters depending on browser), causing share links to break, state to be truncated, or URLs to fail silently.

**Why it happens:** Encoding typography settings, color palettes, image data URIs, logo uploads, and UI preview state creates large payloads. Without compression, URL length explodes quickly. Even with compression, edge cases (many custom colors, large base64 images) can exceed limits.

**Consequences:**
- Share links break for certain canvas configurations
- Users lose work when copying URLs
- Silent failures — URL appears to work but state is incomplete
- Safari's ~80k limit is more restrictive than Chrome's ~2MB
- Mobile browsers may have different limits than desktop

**Prevention:**
1. **Use lz-string compression** — Specifically `compressToEncodedURIComponent` which produces URI-safe output
2. **Avoid `+` character bug** — Ensure compressed strings don't contain `+` (which gets interpreted as whitespace). The correct base64url standard excludes `+` in favor of `-` and `_`.
3. **Separate storage strategies by size:**
   - **< 2,000 chars:** URL state only (works everywhere)
   - **2,000-65,000 chars:** URL + localStorage backup
   - **> 65,000 chars:** localStorage only, URL contains hash reference
4. **Image data strategy:**
   - Don't encode full image data URIs in URL state
   - Store images in localStorage with hash reference
   - Share link includes hash, image loaded from localStorage or prompts re-upload
5. **Graceful degradation:**
   - Detect URL length before encoding
   - Show warning when state approaches 1,500 chars (uncompressed)
   - Offer "Download JSON" alternative for large states
6. **Monitor length thresholds:**
   ```javascript
   const url = new URL(window.location);
   if (url.href.length > 2000) {
     console.warn('URL approaching browser limits');
   }
   ```

**Detection:**
- URL length exceeds 2,000 characters (warning threshold)
- State deserialization errors in browser console
- Users report "link doesn't work" for specific canvas configurations
- Different behavior in Chrome vs Safari vs Firefox

**Phase mapping:** State management phase (URL encoding) and Image handling phase

**Sources:**
- [Limits | nuqs](https://nuqs.dev/docs/limits) — MEDIUM confidence
- [Maximum length of a URL in different browsers](https://www.geeksforgeeks.org/computer-networks/maximum-length-of-a-url-in-different-browsers/) — MEDIUM confidence
- [lz-string GitHub - URI Component encoding issue](https://github.com/pieroxy/lz-string/issues/50) — HIGH confidence (official repo)
- [Effective Strategies for Handling Long Query Strings](https://medium.com/suyeonme/effective-strategies-for-handling-long-query-strings-b790e1fddd65) — MEDIUM confidence

---

### Pitfall 3: Logo Extraction Is Fundamentally Unreliable

**What goes wrong:** Automated logo detection fails due to inconsistent markup, dynamic loading, SVG complexity, multiple logo variants (dark/light mode), favicon vs actual logo confusion, and lack of semantic HTML.

**Why it happens:** There's no standard HTML element for logos. Sites use `<img>`, `<svg>`, CSS backgrounds, `<picture>`, or JavaScript-rendered canvases. Logo detection requires heuristics (looking for "logo" class names, header placement, image dimensions) which are easily fooled. Favicon is not the same as logo — it's a simplified icon.

**Consequences:**
- Extraction captures wrong image (social share icons, ads, hero images)
- No logo found on sites that clearly have one
- SVG logos extracted but fail to render due to missing viewBox
- Multiple logos found (dark mode variant, mobile variant, footer version) — which one to use?
- Users frustrated by unreliable core feature

**Prevention:**
1. **Accept logo extraction as best-effort** — Document in UI that extraction may fail
2. **Manual upload fallback** — Make upload path equally prominent, not hidden as "Plan B"
3. **Default to favicon with disclaimer** — Favicon is reliably available via `/favicon.ico` or `<link rel="icon">`, but warn users it's not the full logo
4. **Multi-heuristic approach:**
   - Check `<img>` tags with "logo" in class/id/alt
   - Check `<svg>` in header/navigation areas
   - Check CSS background images in header
   - Check Open Graph image (`og:image`) as last resort
   - Rank candidates by size, position, aspect ratio
5. **User verification step:**
   - Show extracted logo preview
   - "Is this your logo?" confirmation
   - Quick re-extraction or upload alternative
6. **Logo cleanup:**
   - Strip surrounding whitespace/padding
   - Ensure SVG has proper viewBox
   - Convert to PNG if SVG has external dependencies
7. **Monogram fallback** — Generate from domain name (e.g., "AB" for acmebrand.com) as absolute last resort

**Detection:**
- Extraction returns no logo on sites with visible branding
- Extracted "logo" is clearly not a logo (screenshot reveals wrong element)
- SVG logos render blank or distorted
- User clicks "manual upload" immediately after extraction (indicates failure)

**Phase mapping:** Extraction phase (logo detection) and Fallback UI phase

**Sources:**
- [Logo vs Icon—Differences for Designers](https://marlostudios.co/blogs/journal/logo-vs-icon) — MEDIUM confidence
- [The Favicon: A Tiny but Mighty Variation of Logo Design](https://kreafolk.com/blogs/articles/favicon-variation-logo-design) — MEDIUM confidence
- [State of Web Scraping 2026](https://www.browserless.io/blog/state-of-web-scraping-2026) — MEDIUM confidence (general scraping challenges apply)

---

### Pitfall 4: Canvas Rendering Performance Degrades Quickly

**What goes wrong:** Live updates become janky or freeze the browser when rendering canvas with custom fonts, color gradients, shadows, and complex layouts. Performance issues are painfully visible to users.

**Why it happens:** Canvas rendering runs on the main thread. Repeated calls to `beginPath()`, `arc()`, `fill()`, `stroke()`, `save()`, `restore()` stack up quickly. When called thousands of times per frame (e.g., during live typography updates), this creates visible lag. State machine overhead compounds — changing fill colors, stroke styles, or shadows between draw operations is expensive.

**Consequences:**
- UI feels sluggish during live editing
- Typography changes take 500ms+ to reflect
- Color picker updates drop below 30fps
- Mobile performance is catastrophically worse (weak GPUs)
- Users assume the app is broken or low-quality

**Prevention:**
1. **CSS-driven rendering over canvas** — Use CSS transforms, backgrounds, and text rendering instead of canvas drawing when possible. "CSS transforms are faster since they use the GPU."
2. **Debounce live updates** — Delay re-renders by 100-300ms after user stops typing/dragging. Use `requestAnimationFrame` instead of `setInterval` for animations.
3. **Batch rendering by color** — Render all elements of the same fill color together instead of switching state repeatedly. "It's cheaper to render by color rather than by placement on the canvas."
4. **Offscreen canvas for static elements** — Pre-render static backgrounds, gradients, or repeated patterns to offscreen canvas, then composite onto main canvas.
5. **Disable alpha channel when not needed** — Set `{ alpha: false }` when creating canvas context if transparency isn't required. Browser can optimize internally.
6. **Round coordinates to whole pixels** — `drawImage(x, y)` is faster when x and y are integers. Avoid sub-pixel rendering.
7. **Avoid expensive operations:**
   - `shadowBlur` — extremely slow, use sparingly or CSS box-shadow instead
   - Text rendering — minimize calls to `fillText()`, cache text metrics
   - Unnecessary canvas state changes — batch similar operations
8. **Monitor performance:**
   ```javascript
   const start = performance.now();
   renderCanvas();
   const duration = performance.now() - start;
   if (duration > 16) { // 60fps = 16ms per frame
     console.warn('Render exceeded frame budget:', duration);
   }
   ```

**Detection:**
- Frame times exceed 16ms (60fps threshold)
- Input lag > 100ms between user action and visual update
- Browser DevTools Performance panel shows long tasks
- Mobile devices drop to <30fps during updates

**Phase mapping:** Live preview phase (rendering optimization) and Mobile responsiveness phase

**Sources:**
- [Optimizing canvas - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) — HIGH confidence (official docs)
- [Improving HTML5 Canvas performance | web.dev](https://web.dev/canvas-performance/) — HIGH confidence (official Google docs)
- [Optimising HTML5 Canvas Rendering](https://blog.ag-grid.com/optimising-html5-canvas-rendering-best-practices-and-techniques/) — MEDIUM confidence

---

### Pitfall 5: Font Extraction Returns Computed vs Declared Fonts

**What goes wrong:** Font detection tools capture the font that actually rendered (often a system fallback like Arial or San Francisco) instead of the web font declared in CSS. Users extract "Arial" when the site uses "Inter" with Arial as fallback.

**Why it happens:** Browsers compute the final rendered font after the cascade: declared web fonts → fallback stack → system defaults. If the web font hasn't loaded yet, or fails to load, the browser renders with the fallback. Font detection tools that read computed styles capture this fallback, not the intended font.

**Consequences:**
- Extracted typography doesn't match the site's actual brand
- Users get "Arial" or "Helvetica" instead of custom web fonts
- False confidence in extracted data (looks plausible but wrong)
- Extraction becomes unreliable for sites with slow font loading

**Prevention:**
1. **Read CSS declarations, not computed styles:**
   - Parse stylesheet `font-family` declarations directly
   - Don't rely solely on `getComputedStyle(element).fontFamily`
2. **Wait for fonts to load:**
   - Use `document.fonts.ready` Promise before extraction
   - Check `document.fonts.check('16px FontName')` for specific fonts
   - Timeout after 3 seconds if fonts don't load
3. **Cross-reference with loaded fonts:**
   - Query `document.fonts` for all loaded fonts
   - Match CSS declarations against actually loaded fonts
   - Flag cases where declared font isn't in loaded set
4. **Check Google Fonts API calls:**
   - Inspect network requests for `fonts.googleapis.com`
   - Parse font families from API URL parameters
   - Higher confidence than DOM inspection
5. **Multiple detection strategies:**
   - Strategy 1: Parse `<link>` tags for Google Fonts
   - Strategy 2: Read CSS `@font-face` declarations
   - Strategy 3: Check computed styles as fallback
   - Combine results with confidence scoring
6. **User verification:**
   - Show extracted font name with preview
   - "Does this match the site's typography?"
   - Quick re-selection from Google Fonts if wrong

**Detection:**
- Extracted font is always Arial, Helvetica, Times New Roman (common system fallbacks)
- Visual comparison shows mismatch between site and extracted typography
- User immediately changes font after extraction (indicates wrong detection)

**Phase mapping:** Extraction phase (font detection) and Verification UI phase

**Sources:**
- [Which fallback fonts should we choose](https://dev.to/masakudamatsu/which-fallback-fonts-should-we-choose-to-make-fout-less-jarring-3d8d) — MEDIUM confidence
- [CSS Basics: Fallback Font Stacks](https://css-tricks.com/css-basics-fallback-font-stacks-robust-web-typography/) — MEDIUM confidence
- [WhatFont tool documentation](https://www.elegantthemes.com/blog/wordpress/how-to-see-what-font-a-website-is-using) — MEDIUM confidence

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or user friction but are recoverable.

### Pitfall 6: Google Fonts CORS Errors on Self-Hosted Fonts

**What goes wrong:** When loading Google Fonts locally (for performance or GDPR compliance), CORS errors occur if fonts are hosted with incorrect headers or absolute URLs instead of relative paths.

**Why it happens:** Browsers enforce CORS for web fonts. If fonts are served from a different origin (e.g., CDN or different subdomain) without proper `Access-Control-Allow-Origin` headers, the browser blocks loading. This is especially common in multi-domain setups (e.g., WPML serving different languages on different domains).

**Consequences:**
- Fonts fail to load despite being present in the codebase
- Console shows CORS errors: "No 'Access-Control-Allow-Origin' header is present"
- Fallback fonts render instead, breaking visual consistency
- Issue only appears in production, not local development

**Prevention:**
1. **Use Google Fonts CDN directly** — `fonts.googleapis.com` already sends correct CORS headers
2. **If self-hosting, configure server headers:**
   - Apache: `Header set Access-Control-Allow-Origin "*"` for font file extensions
   - Nginx: `add_header Access-Control-Allow-Origin "*";`
3. **Use relative URLs for local fonts:**
   - `/wp-content/uploads/fonts/font.woff2` not `https://primary-domain.com/wp-content/.../font.woff2`
   - Ensures each domain serves fonts as local resources
4. **Preload critical fonts:**
   ```html
   <link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossorigin>
   ```
   Note: `crossorigin` attribute required even for same-origin fonts
5. **Test across domains/subdomains** — CORS issues appear in multi-domain configurations
6. **Monitor browser console** — CORS errors are clearly logged

**Detection:**
- Console errors mentioning CORS and font files
- Network tab shows font requests with failed CORS check
- Fonts render in dev but fail in production
- Issue appears on specific domains/subdomains only

**Phase mapping:** Font loading phase (Google Fonts integration) and Multi-domain testing phase

**Sources:**
- [Troubleshooting | Google Fonts](https://developers.google.com/fonts/docs/troubleshooting) — HIGH confidence (official docs)
- [Elementor + WPML CORS issue](https://github.com/elementor/elementor/issues/32313) — HIGH confidence (official issue tracker)
- [Cross Domain Fonts CORS](https://www.hirehop.com/blog/cross-domain-fonts-cors-font-face-issue/) — MEDIUM confidence

---

### Pitfall 7: Color Extraction Misses Visually Dominant Small Regions

**What goes wrong:** Automated color extraction using clustering (k-means, histogram analysis) captures colors by pixel frequency, missing small but visually dominant areas like brand accent colors or CTA buttons.

**Why it happens:** Human vision prioritizes visual importance over pixel count. A small red button on a white background dominates attention, but only represents 1% of pixels. Traditional algorithms extract white as dominant color. Small region detection is a known limitation of clustering methods.

**Consequences:**
- Extracted palette lacks brand accent colors
- Captures background colors instead of brand identity colors
- Color schemes feel generic (lots of grays and whites)
- Users have to manually add brand colors, defeating extraction purpose

**Prevention:**
1. **Semantic element targeting:**
   - Extract colors from high-value elements: buttons, links, headings, logos
   - Weight colors by semantic importance, not pixel frequency
2. **Segmentation-based extraction:**
   - Use semantic segmentation to identify salient objects
   - Extract dominant colors from each segment separately
   - Higher accuracy and better anti-interference than pure clustering
3. **Multi-strategy approach:**
   - Strategy 1: Element-based extraction (buttons, headings)
   - Strategy 2: k-means clustering on full page
   - Strategy 3: Check CSS custom properties (`--brand-primary`)
   - Combine with confidence scoring
4. **User-guided extraction:**
   - Click elements on screenshot to sample colors
   - "Add this color to palette" interaction
   - Manual refinement expected, not extraction failure
5. **Check CSS variables first:**
   - Many sites define brand colors as CSS custom properties
   - Parse `:root { --color-primary: #...; }` declarations
   - Higher confidence than visual analysis
6. **Color role assignment:**
   - Don't just extract colors, assign roles (primary, secondary, accent, text, background)
   - Use position/context to infer roles

**Detection:**
- Extracted palette lacks obvious brand colors visible on site
- Palette dominated by grays, whites, blacks (background colors)
- User immediately opens color picker after extraction
- Visual comparison shows mismatch

**Phase mapping:** Extraction phase (color detection) and Color role assignment phase

**Sources:**
- [Comparative Analysis of Clustering Algorithms for Human-Consistent Dominant Color Extraction](https://ieeexplore.ieee.org/document/11139272/) — HIGH confidence (academic research)
- [New Approach to Dominant and Prominent Color Extraction](https://www.mdpi.com/2227-7080/13/6/230) — HIGH confidence (peer-reviewed)
- [A better way of extracting dominant colors using salient objects](https://www.sciencedirect.com/science/article/abs/pii/S0952197621000518) — HIGH confidence (academic)

---

### Pitfall 8: Mobile Canvas Rendering Is Blurry on High-DPI Screens

**What goes wrong:** Canvas renders blurry text and graphics on mobile devices with Retina/high-DPI screens, even though normal text on the page is sharp. The browser seems to "additionally blur" canvas content on mobile.

**Why it happens:** Canvas dimensions (width/height attributes) don't automatically scale with devicePixelRatio. On iPhones with 2x or 3x pixel density, a 300x300 canvas is rendered to 300 physical pixels, then upscaled to 600-900 pixels, causing blur. The browser renders canvas "as if the screen were regular, low PPI."

**Consequences:**
- Canvas looks acceptable on desktop, terrible on mobile
- Text in UI preview tile is unreadable
- Brand experimentation tool feels low-quality on primary devices
- No workaround for users — they can't fix it

**Prevention:**
1. **Scale canvas by devicePixelRatio:**
   ```javascript
   const dpr = Math.ceil(window.devicePixelRatio || 1);
   canvas.width = logicalWidth * dpr;
   canvas.height = logicalHeight * dpr;
   ctx.scale(dpr, dpr);
   ```
   Use `Math.ceil()` to handle fractional pixel ratios.

2. **Separate logical size from physical size:**
   - CSS size: `canvas { width: 300px; height: 300px; }`
   - Canvas dimensions: `canvas.width = 300 * dpr` (e.g., 600 or 900)
   - Scale context to compensate

3. **Handle orientation changes:**
   ```javascript
   window.addEventListener('orientationchange', () => {
     resizeCanvas();
     redraw();
   });
   ```

4. **Consider VBCanvas library:**
   - Introduces SVG-like viewBox attribute for responsive canvas
   - Handles devicePixelRatio automatically
   - Trade-off: additional dependency

5. **Test on actual devices:**
   - Chrome DevTools mobile emulation doesn't catch all DPI issues
   - Test on iPhone, iPad, Android devices with 2x/3x screens

6. **Offscreen canvas for performance:**
   - Pre-render at high DPI to offscreen canvas
   - Composite to main canvas as needed
   - Avoids repeated high-resolution rendering

**Detection:**
- Canvas looks sharp on desktop, blurry on mobile
- Text in canvas is harder to read than normal page text
- `window.devicePixelRatio` > 1 but canvas dimensions don't account for it
- Screenshot from mobile device shows pixelated rendering

**Phase mapping:** Canvas rendering phase and Mobile responsiveness phase

**Sources:**
- [How to Fix Blurry Text on HTML Canvases on Mobile Phones](https://dev.to/pahund/how-to-fix-blurry-text-on-html-canvases-on-mobile-phones-3iep) — MEDIUM confidence
- [HTML5 canvas... responsive!](https://dev.to/georgedoescode/html5-canvas-responsive-2keh) — MEDIUM confidence
- [HTML5 for the Mobile Web: Canvas](https://mobiforge.com/design-development/html5-mobile-web-canvas) — MEDIUM confidence

---

### Pitfall 9: Debouncing Live Updates Can Feel Janky vs useDeferredValue

**What goes wrong:** Using traditional debouncing (delay execution by N milliseconds) for live preview updates still produces janky experiences because it blocks the main thread. Typing feels sluggish even with optimized debounce timing.

**Why it happens:** Debounce postpones expensive rendering, but when the delayed render executes, it still blocks user input. During a 200ms debounce window, if the user types again, the previous render is wasted work. React 18's `useDeferredValue` is better because it's interruptible — if the user types mid-render, React abandons that render and starts fresh.

**Consequences:**
- Input feels laggy despite debouncing
- Typing → wait → render → typing produces stop-start rhythm
- Mobile devices especially janky (weaker CPUs)
- Users perceive app as unresponsive

**Prevention:**
1. **Prefer React 18 `useDeferredValue` over manual debouncing:**
   ```javascript
   const deferredState = useDeferredValue(canvasState);
   ```
   - Interruptible by default
   - Adapts to user's device speed
   - No fixed delay to tune

2. **If using debounce, use `requestAnimationFrame`:**
   - Not `setTimeout` or `setInterval`
   - Syncs with browser paint cycle
   - Better frame pacing

3. **Separate input handling from rendering:**
   - Immediate: Update input field value (instant feedback)
   - Deferred: Update canvas preview (expensive operation)
   - User sees typing instantly, preview updates shortly after

4. **Progressive rendering for large updates:**
   - Render critical elements first (e.g., text changes)
   - Defer secondary updates (e.g., shadows, gradients)
   - Use `requestIdleCallback` for non-critical work

5. **Monitor input lag:**
   ```javascript
   const inputTime = performance.now();
   // ...after update
   const lag = performance.now() - inputTime;
   if (lag > 100) {
     console.warn('Input lag detected:', lag);
   }
   ```

6. **Tune debounce delay based on operation:**
   - Typography changes: 150-200ms (frequent, low cost)
   - Color changes: 100ms (very frequent, medium cost)
   - Image uploads: 0ms (infrequent, high cost but expected delay)

**Detection:**
- Typing feels sluggish even with debouncing
- DevTools Performance panel shows long tasks blocking input
- Mobile users report "slow" or "laggy" experience
- Input events queue up during rendering

**Phase mapping:** Live preview phase (rendering optimization) and React 18 migration phase

**Sources:**
- [useDeferredValue – React](https://react.dev/reference/react/useDeferredValue) — HIGH confidence (official docs)
- [How to debounce and throttle in React without losing your mind](https://www.developerway.com/posts/debouncing-in-react) — MEDIUM confidence
- [Understanding Debounce in JavaScript](https://dev.to/teaganga/understanding-debounce-in-javascript-a-guide-with-examples-3cm4) — MEDIUM confidence

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 10: localStorage Quota Exceeded with Large Image Data URIs

**What goes wrong:** Storing base64-encoded images in localStorage hits the 5-10MB quota limit, causing `QuotaExceededError` and silently failing persistence.

**Why it happens:** localStorage has 5MB limit in most browsers (10MB in some). A single high-resolution image encoded as base64 can be 1-2MB. Storing multiple images or canvas snapshots quickly exhausts quota.

**Prevention:**
1. **Store images separately from state:**
   - Use IndexedDB for large binary data
   - localStorage only for small text state
2. **Compress images before storage:**
   - Resize to max 1200px wide
   - Use JPEG quality 80-85% for photos
   - Use PNG only for logos with transparency
3. **Check quota before storing:**
   ```javascript
   try {
     localStorage.setItem(key, value);
   } catch (e) {
     if (e.name === 'QuotaExceededError') {
       // Handle: clear old data, show warning, use IndexedDB
     }
   }
   ```
4. **Provide download/export alternative:**
   - "Storage full — download JSON file instead"
   - Users can re-import when needed

**Detection:**
- `QuotaExceededError` in console
- localStorage mysteriously fails to save
- State persists without images

**Phase mapping:** Persistence phase (localStorage handling)

---

### Pitfall 11: Font Loading Race Condition on Initial Render

**What goes wrong:** Canvas renders before Google Fonts load, showing fallback fonts initially, then "jumps" when web fonts load. Creates visual instability.

**Why it happens:** Font requests are async. Initial render uses system fallbacks (Arial, Times), then re-renders when `@font-face` loads. This is FOUT (Flash of Unstyled Text) but for canvas.

**Prevention:**
1. **Wait for fonts before rendering:**
   ```javascript
   await document.fonts.ready;
   renderCanvas();
   ```
2. **Show loading state:**
   - "Loading fonts..." spinner
   - Blank canvas until fonts ready
3. **Preload critical fonts:**
   ```html
   <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter" as="style">
   ```
4. **Use font-display: swap carefully:**
   - `swap` shows fallback immediately (creates jump)
   - `block` waits for font (avoids jump but delays render)
   - `optional` skips font if not cached (faster but inconsistent)

**Detection:**
- Canvas flashes from Arial to custom font
- Layout shifts as fonts load
- First paint uses wrong typography

**Phase mapping:** Font loading phase (Google Fonts integration)

---

### Pitfall 12: SVG Logo Extraction Missing viewBox Attribute

**What goes wrong:** Extracted SVG logos render blank or at incorrect size because they lack `viewBox` attribute.

**Why it happens:** Many inline SVGs rely on parent container dimensions instead of intrinsic `viewBox`. When extracted and rendered standalone, they have no defined coordinate system.

**Prevention:**
1. **Validate SVG on extraction:**
   ```javascript
   const svg = extractedSVG;
   if (!svg.includes('viewBox')) {
     // Calculate from width/height or bbox
     // Add viewBox attribute
   }
   ```
2. **Provide manual upload fallback:**
   - "SVG missing viewBox — upload PNG instead"
3. **Convert problematic SVGs to PNG:**
   - Render to canvas, export as PNG
   - Avoids SVG compatibility issues

**Detection:**
- Extracted logo appears blank
- SVG inspector shows missing viewBox
- Logo renders at 0x0 or incorrect dimensions

**Phase mapping:** Logo extraction phase

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| CORS Proxy Setup | Using public third-party proxy (Pitfall 1) | Self-host Cloudflare Worker from day one with rate limiting |
| Font Extraction | Extracting computed fallback fonts instead of declared web fonts (Pitfall 5) | Parse CSS declarations, wait for fonts to load, cross-reference with `document.fonts` |
| Color Extraction | Missing visually dominant small regions like brand accents (Pitfall 7) | Use semantic element targeting, check CSS custom properties first |
| Logo Extraction | Fundamentally unreliable due to inconsistent markup (Pitfall 3) | Treat as best-effort, prominent manual upload fallback, favicon with disclaimer |
| Canvas Rendering | Performance degrades on live updates (Pitfall 4) | CSS-driven rendering, debounce updates, batch operations, offscreen canvas |
| URL State Encoding | Exceeding browser length limits (Pitfall 2) | lz-string compression, avoid image data URIs in URL, localStorage backup |
| Mobile Canvas | Blurry rendering on high-DPI screens (Pitfall 8) | Scale by devicePixelRatio, test on actual devices |
| Google Fonts Integration | CORS errors on self-hosted fonts (Pitfall 6) | Use CDN directly or configure server headers, use relative URLs |
| Live Preview Optimization | Janky debouncing experience (Pitfall 9) | Prefer React 18 useDeferredValue, use requestAnimationFrame |
| Image Persistence | localStorage quota exceeded (Pitfall 10) | Use IndexedDB for images, compress before storing, provide download export |
| Initial Font Loading | Race condition causing visual jump (Pitfall 11) | Wait for `document.fonts.ready`, show loading state, preload critical fonts |
| SVG Logo Handling | Missing viewBox attribute (Pitfall 12) | Validate and add viewBox, provide PNG upload fallback |

---

## Research Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| CORS Proxy Challenges | MEDIUM | WebSearch + community forums, verified with official Cloudflare docs |
| Canvas Performance | HIGH | Official MDN/web.dev documentation + performance benchmarks |
| URL State Limits | MEDIUM-HIGH | Browser specs + library docs (nuqs, lz-string) |
| Font Extraction | MEDIUM | CSS specs + community tools (WhatFont), practical experience sources |
| Logo Detection | MEDIUM | Web scraping challenges + brand identity sources, logical inference |
| Color Extraction | HIGH | Academic research papers (IEEE, MDPI, ScienceDirect) |
| Google Fonts CORS | HIGH | Official Google Fonts docs + GitHub issue trackers |
| Mobile Canvas DPI | MEDIUM | Developer blogs + MDN, consistent across sources |
| Debouncing vs useDeferredValue | HIGH | Official React docs + performance analysis |

**Overall Confidence: MEDIUM-HIGH**

Most pitfalls verified with multiple credible sources. Color extraction and canvas performance have strong academic/official backing. CORS proxy and logo detection rely more on community knowledge and web scraping best practices (2026 sources).

---

## Sources Summary

**HIGH Confidence (Official docs, academic research, spec documents):**
- [MDN: Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [web.dev: Canvas Performance](https://web.dev/canvas-performance/)
- [Google Fonts: Troubleshooting](https://developers.google.com/fonts/docs/troubleshooting)
- [React: useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [IEEE: Clustering Algorithms for Color Extraction](https://ieeexplore.ieee.org/document/11139272/)
- [MDPI: Dominant Color Extraction](https://www.mdpi.com/2227-7080/13/6/230)
- [lz-string GitHub Issue #50](https://github.com/pieroxy/lz-string/issues/50)
- [Elementor GitHub Issue #32313](https://github.com/elementor/elementor/issues/32313)

**MEDIUM Confidence (Developer blogs, community forums, cross-verified sources):**
- [httptoolkit.com: CORS Proxies](https://httptoolkit.com/blog/cors-proxies/)
- [nuqs: URL State Limits](https://nuqs.dev/docs/limits)
- [DEV Community: Mobile Canvas Blur Fix](https://dev.to/pahund/how-to-fix-blurry-text-on-html-canvases-on-mobile-phones-3iep)
- [CSS-Tricks: Fallback Font Stacks](https://css-tricks.com/css-basics-fallback-font-stacks-robust-web-typography/)
- [developerway.com: Debouncing in React](https://www.developerway.com/posts/debouncing-in-react)
- [Cloudflare Community: CORS on 429](https://community.cloudflare.com/t/cors-on-rate-limit-429/270010)

**Additional Context:**
- [State of Web Scraping 2026](https://www.browserless.io/blog/state-of-web-scraping-2026)
- [GeeksforGeeks: URL Length Limits](https://www.geeksforgeeks.org/computer-networks/maximum-length-of-a-url-in-different-browsers/)
- [The Favicon Guide 2026](https://kreafolk.com/blogs/articles/favicon-variation-logo-design)
