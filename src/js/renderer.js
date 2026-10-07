/*
  VANTA line-screen renderer.

  One shared WebGL2 context renders every generative plate on the page and
  copies the result into each visible <canvas> with drawImage. This keeps us
  far below browser context limits and lets the hero, the work plates and the
  case view share a single compiled program.

  Every scene returns a luminance field. The field is never shown directly:
  it is translated into an engraved line screen whose line thickness encodes
  light. `resolve` controls the line period, so plates "develop" from coarse
  bars into fine engraving.
*/

const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;      // view size, device px
uniform vec4  uFrame;    // framing rect (x, y from bottom, w, h), device px
uniform float uTime;
uniform vec2  uMouse;    // device px, bottom-left origin
uniform float uLens;     // 0..1
uniform float uResolve;  // 0 coarse .. 1 fine
uniform int   uScene;
uniform float uSeed;
uniform float uAngle;
uniform vec3  uBg;
uniform vec3  uFg;
uniform float uGain;
uniform float uScale;    // device px per css px
uniform float uPeriod;   // finest period in css px
uniform sampler2D uGlyph;

#define PI 3.14159265
float gAsp = 1.0;        // frame width / height, set in main()

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// ---------- scenes: return light 0..1 for uv (y spans -0.5..0.5) ----------

// 0 · Interference — the standing fringes between two sources (sound made visible)
float sInterference(vec2 uv, float t){
  float sx = max(gAsp, 0.8);
  vec2 a = vec2(-0.26 * sx + 0.035 * sin(t * 0.29), -0.12 + 0.03 * cos(t * 0.23));
  vec2 b = vec2( 0.22 * sx + 0.035 * cos(t * 0.25),  0.14 - 0.03 * sin(t * 0.19));
  float ra = length(uv - a), rb = length(uv - b);
  float fringe = 0.5 + 0.5 * cos((ra - rb) * 46.0 - t * 0.5);
  float ripple = 0.5 + 0.5 * cos((ra + rb) * 23.0 - t * 1.3);
  float v = pow(fringe, 1.6) * (0.78 + 0.22 * ripple);
  float near = smoothstep(0.55, 0.0, min(ra, rb));
  float src = smoothstep(0.022, 0.012, min(ra, rb));
  vec2 q = uv / vec2(sx * 0.5, 0.5);
  float fall = 1.0 - 0.5 * smoothstep(0.4, 1.3, length(q));
  return clamp(v * (0.62 + 0.38 * near) * fall + src, 0.0, 1.0);
}

// 1 · Orb — a lit sphere with a slow terminator (light as subject)
float sOrb(vec2 uv, float t){
  float R = 0.33;
  vec2 q = (uv - vec2(0.0, 0.0)) / R;
  float r2 = dot(q, q);
  vec3 l = normalize(vec3(cos(t * 0.21) * 0.9, 0.35 + 0.25 * sin(t * 0.17), 0.55));
  if (r2 > 1.0){
    // a thin halo of reflected light on the floor plane
    float halo = smoothstep(1.35, 1.0, sqrt(r2)) * 0.12;
    return halo;
  }
  vec3 n = vec3(q, sqrt(1.0 - r2));
  float d = max(dot(n, l), 0.0);
  float rim = pow(1.0 - n.z, 3.0) * 0.25;
  float tex = fbm(n.xy * 2.5 + vec2(t * 0.05, 0.0));
  return clamp(pow(d, 1.35) * (0.82 + 0.3 * tex) + rim, 0.0, 1.0);
}

// 2 · Twist — a twisting stack of slabs, raymarched (structure, ledger)
float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
// nine stacked slabs, each turned a little further than the one below
float mapTwist(vec3 p, float t){
  float h = 0.09;
  float c = floor(p.y / h + 0.5);
  float d = 1e3;
  for (int j = -1; j <= 1; j++){
    float id = clamp(c + float(j), -4.0, 4.0);
    vec3 q = p;
    q.y -= id * h;
    q.xz *= rot(id * 0.21 + t * 0.28 + 0.16 * sin(t * 0.45 + id * 0.7));
    d = min(d, sdBox(q, vec3(0.2, h * 0.34, 0.2)) - 0.003);
  }
  return d;
}
float sTwist(vec2 uv, float t){
  vec3 ro = vec3(0.0, 0.5, 1.5);
  vec3 ww = normalize(-ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.55 * ww);
  float d = 0.0; float hit = 0.0;
  for (int i = 0; i < 96; i++){
    vec3 p = ro + rd * d;
    float h = mapTwist(p, t);
    if (h < 0.0008){ hit = 1.0; break; }
    d += h * 0.9;
    if (d > 3.2) break;
  }
  if (hit < 0.5) return 0.0;
  vec3 p = ro + rd * d;
  vec2 e = vec2(0.002, 0.0);
  vec3 n = normalize(vec3(
    mapTwist(p + e.xyy, t) - mapTwist(p - e.xyy, t),
    mapTwist(p + e.yxy, t) - mapTwist(p - e.yxy, t),
    mapTwist(p + e.yyx, t) - mapTwist(p - e.yyx, t)));
  vec3 l = normalize(vec3(0.55, 0.8, 0.35));
  float dif = max(dot(n, l), 0.0);
  float top = smoothstep(0.8, 0.98, n.y) * 0.12;
  return clamp(0.04 + dif * 0.92 + top, 0.0, 1.0);
}

// 3 · Relief — hillshaded terrain under a moving sun (ground, distance)
float fbm3(vec2 p){ float v = 0.0, a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8); for (int i = 0; i < 3; i++){ v += a * noise(p); p = r * p * 2.03; a *= 0.5; } return v; }
float height(vec2 p){ vec2 w = vec2(fbm3(p * 0.8 + 3.1), fbm3(p * 0.8 - 1.7)); return fbm3(p + w * 0.9); }
float sTerrain(vec2 uv, float t){
  float hor = 0.16;
  float sky = smoothstep(0.08, 0.075, length(uv - vec2(0.22, hor + 0.085))) * 0.92;
  float below = step(uv.y, hor);
  float z = 0.34 / max(hor - uv.y, 0.004);
  vec2 p = vec2(uv.x * z * 0.9, z * 0.9 - t * 0.22) + uSeed * 3.0;
  float e = 0.015 * z;
  float h = height(p);
  vec3 n = normalize(vec3(height(p - vec2(e, 0.0)) - height(p + vec2(e, 0.0)), height(p - vec2(0.0, e)) - height(p + vec2(0.0, e)), e * 1.4));
  vec3 l = normalize(vec3(-0.5, 0.75, 0.45));
  float shade = pow(max(dot(n, l), 0.0), 1.8) * (0.5 + h);
  float fog = exp(-z * 0.11);
  float ground = clamp(shade * fog * 1.25 + smoothstep(0.03, 0.0, hor - uv.y) * 0.25, 0.0, 1.0);
  return mix(sky, ground, below);
}

// 4 · Glyph — an embossed letterform from the studio typeface
float glyphH(vec2 st){ return textureLod(uGlyph, st, 3.2).r; }
float sGlyph(vec2 uv, float t){
  vec2 g = uv;
  g.x += 0.012 * sin(uv.y * 6.0 + t * 0.6);
  vec2 st = vec2(g.x, -g.y) * 0.92 + 0.5;
  float inside = step(0.0, st.x) * step(st.x, 1.0) * step(0.0, st.y) * step(st.y, 1.0);
  st = clamp(st, 0.0, 1.0);
  float a = textureLod(uGlyph, st, 0.0).r * inside;
  float e = 0.006;
  vec3 n = normalize(vec3(glyphH(st - vec2(e, 0.0)) - glyphH(st + vec2(e, 0.0)), glyphH(st + vec2(0.0, e)) - glyphH(st - vec2(0.0, e)), 0.18));
  vec3 l = normalize(vec3(cos(t * 0.4) * 0.8, 0.5 + 0.3 * sin(t * 0.3), 0.6));
  float shade = 0.18 + 0.95 * max(dot(n, l), 0.0);
  return a * shade;
}

// 5 · Eclipse — a dark disc crossing a bright one (cinema, festival)
float sEclipse(vec2 uv, float t){
  float r = length(uv);
  vec2 c2 = vec2(0.08 * sin(t * 0.25), 0.03 * cos(t * 0.2));
  float sun = smoothstep(0.30, 0.295, r);
  float moon = smoothstep(0.285, 0.29, length(uv - c2));
  float corona = exp(-max(r - 0.29, 0.0) * 9.0) * (0.55 + 0.45 * fbm(vec2(atan(uv.y, uv.x) * 3.0, r * 6.0 - t * 0.3)));
  return clamp(sun * moon + corona * (1.0 - sun * (1.0 - moon)) * 0.9, 0.0, 1.0);
}

// 6 · Vessel — a turning lathe form, raymarched (ceramics, craft)
float mapVessel(vec3 p, float t){
  p.xz *= rot(t * 0.3);
  float y = p.y;
  float prof = 0.17 + 0.09 * sin(y * 5.2 + 1.2) + 0.03 * sin(y * 13.0);
  float r = length(p.xz);
  float d = (r - prof) * 0.6;
  d = max(d, abs(y) - 0.38);
  return d;
}
float sVessel(vec2 uv, float t){
  vec3 ro = vec3(0.0, 0.0, 1.75);
  vec3 rd = normalize(vec3(uv, -1.5));
  float d = 0.0, hit = 0.0;
  for (int i = 0; i < 72; i++){
    float h = mapVessel(ro + rd * d, t);
    if (h < 0.001){ hit = 1.0; break; }
    d += h;
    if (d > 3.5) break;
  }
  if (hit < 0.5) return 0.0;
  vec3 p = ro + rd * d;
  vec2 e = vec2(0.002, 0.0);
  vec3 n = normalize(vec3(mapVessel(p + e.xyy, t) - mapVessel(p - e.xyy, t), mapVessel(p + e.yxy, t) - mapVessel(p - e.yxy, t), mapVessel(p + e.yyx, t) - mapVessel(p - e.yyx, t)));
  vec3 l = normalize(vec3(-0.6, 0.5, 0.6));
  float dif = max(dot(n, l), 0.0);
  float spec = pow(max(dot(reflect(-l, n), -rd), 0.0), 24.0);
  return clamp(0.06 + dif * 0.85 + spec * 0.5, 0.0, 1.0);
}

// 7 · Field — lines of force between two poles (energy, systems)
float sField(vec2 uv, float t){
  vec2 a = vec2(-0.2 + 0.03 * sin(t * 0.3), 0.02 * cos(t * 0.4));
  vec2 b = vec2( 0.2 + 0.03 * cos(t * 0.27), -0.02 * sin(t * 0.33));
  vec2 da = uv - a, db = uv - b;
  float psi = atan(da.y, da.x) - atan(db.y, db.x);
  float lines = 0.5 + 0.5 * cos(psi * 9.0 + t * 0.25);
  float pot = 1.0 / (length(da) + 0.05) + 1.0 / (length(db) + 0.05);
  float glow = smoothstep(2.5, 14.0, pot);
  return clamp(pow(lines, 3.0) * (0.35 + 0.65 * glow) + smoothstep(0.035, 0.0, min(length(da), length(db))), 0.0, 1.0) * smoothstep(1.0, 0.3, length(uv * vec2(0.7, 1.0)));
}

float scene(vec2 uv, float t){
  if (uScene == 0) return sInterference(uv, t);
  if (uScene == 1) return sOrb(uv, t);
  if (uScene == 2) return sTwist(uv, t);
  if (uScene == 3) return sTerrain(uv, t);
  if (uScene == 4) return sGlyph(uv, t);
  if (uScene == 5) return sEclipse(uv, t);
  if (uScene == 6) return sVessel(uv, t);
  return sField(uv, t);
}

void main(){
  vec2 px = gl_FragCoord.xy;

  // Magnifying lens around the pointer: sample closer to the centre so the
  // engraving swells and the lines bend like glass laid over a print.
  vec2 dm = px - uMouse;
  float R = 0.26 * min(uFrame.z, uFrame.w);
  float k = uLens * (1.0 - smoothstep(0.0, R, length(dm)));
  k = k * k * (3.0 - 2.0 * k);
  vec2 spx = px - dm * k * 0.42;

  gAsp = uFrame.z / uFrame.w;
  vec2 centre = uFrame.xy + uFrame.zw * 0.5;
  vec2 uv = (spx - centre) / uFrame.w;
  float L = clamp(scene(uv, uTime + uSeed * 10.0) * uGain, 0.0, 1.0);

  float period = mix(uPeriod * 6.0, uPeriod, uResolve) * uScale;
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  float c = dot(spx, vec2(-dir.y, dir.x)) / period;
  float f = abs(fract(c) - 0.5) * 2.0;
  float aa = fwidth(c) * 1.6;
  float th = L * 0.88;
  float ink = (1.0 - smoothstep(th - aa, th + aa, f)) * smoothstep(0.0, 0.04, L);

  outColor = vec4(mix(uBg, uFg, ink), 1.0);
}`

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export class LineRenderer {
  constructor() {
    this.views = new Set()
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvas.height = 2
    const gl = this.canvas.getContext('webgl2', {
      antialias: false, alpha: false, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance',
    })
    this.ok = !!gl
    if (!gl) return
    this.gl = gl
    this.quality = 1 // adaptive multiplier on render scale
    this._slowFrames = 0

    const prog = gl.createProgram()
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s))
        this.ok = false
        return
      }
      gl.attachShader(prog, s)
    }
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); this.ok = false; return }
    gl.useProgram(prog)
    this.prog = prog

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    this.u = {}
    for (const n of ['uRes', 'uFrame', 'uTime', 'uMouse', 'uLens', 'uResolve', 'uScene', 'uSeed', 'uAngle', 'uBg', 'uFg', 'uGain', 'uScale', 'uPeriod', 'uGlyph']) {
      this.u[n] = gl.getUniformLocation(prog, n)
    }

    // glyph texture (filled once fonts are ready)
    this.glyphTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.glyphTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(this.u.uGlyph, 0)

    this.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.ok = false })
  }

  setGlyph(char, family) {
    if (!this.ok) return
    const c = document.createElement('canvas')
    c.width = c.height = 1024
    const x = c.getContext('2d')
    x.fillStyle = '#000'
    x.fillRect(0, 0, 1024, 1024)
    x.fillStyle = '#fff'
    x.textAlign = 'center'
    x.textBaseline = 'alphabetic'
    x.font = `800 820px ${family}`
    const m = x.measureText(char)
    const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent
    x.fillText(char, 512, 512 + (asc - desc) / 2)
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.glyphTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.generateMipmap(gl.TEXTURE_2D)
  }

  /*
    view = {
      canvas,                       target 2D canvas in the DOM
      scene, seed, angle,           scene parameters
      resolve, lens, gain,          animated 0..1 values
      mouse: {x, y},                css px relative to canvas
      frame: () => [x, y, w, h],    optional framing rect in css px (top-left origin)
      bg, fg,                       hex colours
      period,                       finest line period in css px
      visible,                      set by IntersectionObserver
      scale,                        css → device multiplier (before quality)
    }
  */
  add(view) {
    const v = Object.assign({
      scene: 0, seed: 0, angle: 0, resolve: 1, lens: 0, gain: 1,
      mouse: { x: -9999, y: -9999 }, bg: '#0b0b0c', fg: '#ece9e2', period: 3.4,
      visible: true, scale: Math.min(window.devicePixelRatio || 1, 2), time: null,
      maxPixels: 2.4e6, alpha: false, post: null,
    }, view)
    v.ctx = v.canvas.getContext('2d', { alpha: v.alpha })
    v._bg = hex(v.bg); v._fg = hex(v.fg)
    v.setColors = (bg, fg) => { v._bg = hex(bg); v._fg = hex(fg) }
    this.views.add(v)
    this.resizeView(v)
    return v
  }

  remove(v) { this.views.delete(v) }

  resizeView(v) {
    const r = v.canvas.getBoundingClientRect()
    v.cssW = Math.max(1, r.width)
    v.cssH = Math.max(1, r.height)
    const budget = Math.sqrt(v.maxPixels / (v.cssW * v.cssH))
    const s = Math.max(0.5, Math.min(v.scale * this.quality, budget))
    const w = Math.max(2, Math.round(v.cssW * s))
    const h = Math.max(2, Math.round(v.cssH * s))
    if (v.canvas.width !== w || v.canvas.height !== h) { v.canvas.width = w; v.canvas.height = h }
    v.dev = w / v.cssW
    this.dirty = true
  }

  resizeAll() { this.views.forEach((v) => this.resizeView(v)) }

  render(time, frameMs) {
    if (!this.ok) return
    if (this.static) {
      if (!this.dirty) return
      this.dirty = false
    }
    const gl = this.gl
    let maxW = 2, maxH = 2
    const live = []
    this.views.forEach((v) => { if (v.visible && v.cssW > 1) { live.push(v); maxW = Math.max(maxW, v.canvas.width); maxH = Math.max(maxH, v.canvas.height) } })
    if (!live.length) return
    if (this.canvas.width < maxW || this.canvas.height < maxH) {
      this.canvas.width = Math.max(this.canvas.width, maxW)
      this.canvas.height = Math.max(this.canvas.height, maxH)
    }
    const H = this.canvas.height
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.glyphTex)
    for (const v of live) {
      const w = v.canvas.width, h = v.canvas.height, d = v.dev
      gl.viewport(0, 0, w, h)
      const f = v.frame ? v.frame() : [0, 0, v.cssW, v.cssH]
      gl.uniform2f(this.u.uRes, w, h)
      gl.uniform4f(this.u.uFrame, f[0] * d, h - (f[1] + f[3]) * d, f[2] * d, f[3] * d)
      gl.uniform1f(this.u.uTime, v.time ?? time)
      gl.uniform2f(this.u.uMouse, v.mouse.x * d, h - v.mouse.y * d)
      gl.uniform1f(this.u.uLens, v.lens)
      gl.uniform1f(this.u.uResolve, v.resolve)
      gl.uniform1i(this.u.uScene, v.scene)
      gl.uniform1f(this.u.uSeed, v.seed)
      gl.uniform1f(this.u.uAngle, v.angle)
      gl.uniform3fv(this.u.uBg, v._bg)
      gl.uniform3fv(this.u.uFg, v._fg)
      gl.uniform1f(this.u.uGain, v.gain)
      gl.uniform1f(this.u.uScale, d)
      gl.uniform1f(this.u.uPeriod, v.period)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (v.alpha) v.ctx.clearRect(0, 0, w, h)
      v.ctx.drawImage(this.canvas, 0, H - h, w, h, 0, 0, w, h)
      if (v.post) v.post(v.ctx, w, h)
    }

    // Adaptive quality: if frames stay slow, render plates at a lower scale.
    if (frameMs) {
      if (frameMs > 26) this._slowFrames++
      else this._slowFrames = Math.max(0, this._slowFrames - 1)
      if (this._slowFrames > 45 && this.quality > 0.6) {
        this.quality = Math.max(0.6, this.quality - 0.15)
        this._slowFrames = 0
        this.resizeAll()
      }
    }
  }
}
