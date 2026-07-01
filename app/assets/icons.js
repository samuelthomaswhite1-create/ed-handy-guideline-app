/* 24x24 stroke-style SVG icons used by the category tiles + headers.
   Stroke colour is inherited via currentColor; fill is mostly none. */

window.ICONS = {

  // resus / arrest — heart-rate trace pulse
  "activity": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h3l2-6 4 12 3-8 2 2h4"/></svg>`,

  // airway / breathing — lungs
  "lungs": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v8"/><path d="M8 19c-2 0-3.5-1.5-3.5-3.5 0-2.2 1-4.2 2.5-6.5C8.4 6.6 9.7 5 12 5"/><path d="M16 19c2 0 3.5-1.5 3.5-3.5 0-2.2-1-4.2-2.5-6.5C15.6 6.6 14.3 5 12 5"/><path d="M9 19h6"/></svg>`,

  // cardiology — heart with pulse
  "heart-pulse": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/><path d="M3.5 12h4l2-3 3 6 2-3h6"/></svg>`,

  // fever / infection — thermometer
  "thermometer": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4.5a2.5 2.5 0 0 0-5 0V14a4 4 0 1 0 5 0V4.5z"/><circle cx="11.5" cy="17.5" r="2.2" fill="currentColor" stroke="none"/></svg>`,

  // trauma / injury — bandage
  "bandage": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="7" width="17" height="10" rx="2.5" transform="rotate(-15 12 12)"/><circle cx="10" cy="11" r="0.7" fill="currentColor"/><circle cx="13" cy="13" r="0.7" fill="currentColor"/><circle cx="10" cy="14" r="0.7" fill="currentColor"/><circle cx="13" cy="10" r="0.7" fill="currentColor"/></svg>`,

  // neuro — brain
  "brain": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.7V16a3 3 0 0 0 4 2.8V20a2 2 0 0 0 4 0V5a3 3 0 0 0-4 0z"/><path d="M15 5a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.7V16a3 3 0 0 1-4 2.8"/></svg>`,

  // GI — simple stomach shape
  "stomach": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v3a3 3 0 0 0 3 3h2"/><path d="M14 9c3 0 5 2 5 5 0 4-3 7-7 7s-7-2-7-6c0-3 2-5 5-5"/></svg>`,

  // renal / urology — droplet
  "droplet": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5"/></svg>`,

  // endocrine / metabolic — flask
  "flask": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v6L4.5 17a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L15 9V3"/><path d="M8 3h8"/><path d="M7.5 14h9"/></svg>`,

  // haem / onc — blood vial
  "vial": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10"/><path d="M8 3v15a3 3 0 0 0 8 0V3"/><path d="M8 12h8" stroke-width="3" stroke-linecap="butt" opacity="0.35"/></svg>`,

  // skin / allergy — open hand with reaction spots (distinct from the sun it used to be)
  "skin": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.6a1.5 1.5 0 0 1 3 0V10"/><path d="M12 10V4.4a1.5 1.5 0 0 1 3 0V10.5"/><path d="M15 10.6V6.8a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1c-1.9 0-3-1-4.1-2.4l-2.4-3a1.55 1.55 0 0 1 2.4-1.95L9 14"/><path d="M9 11V8.2a1.5 1.5 0 0 0-3 0V13"/><circle cx="13.5" cy="15.5" r="0.7" fill="currentColor" stroke="none"/><circle cx="11" cy="17" r="0.7" fill="currentColor" stroke="none"/></svg>`,

  // poisoning / tox — biohazard
  "biohazard": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V5"/><path d="M14.2 13.2l3.3 3"/><path d="M9.8 13.2l-3.3 3"/><circle cx="12" cy="5" r="2.4"/><circle cx="6.4" cy="17" r="2.4"/><circle cx="17.6" cy="17" r="2.4"/></svg>`,

  // ENT / ophthalmology — ear + eye dual
  "ear-eye": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11c0-3 2-5 5-5s5 2 5 5c0 2-1.5 3-2.5 4-.8.8-1 1.5-1 2.5"/><circle cx="6" cy="11" r="1.2"/><ellipse cx="18" cy="13" rx="4" ry="2.8"/><circle cx="18" cy="13" r="1.2" fill="currentColor" stroke="none"/></svg>`,

  // ortho — bone
  "bone": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 4.5a2.5 2.5 0 1 1 2 4l9 9a2.5 2.5 0 1 1-2 4 2.5 2.5 0 0 1-4 2 2.5 2.5 0 1 1-2-4l-9-9a2.5 2.5 0 1 1 2-4 2.5 2.5 0 0 1 4-2z"/></svg>`,

  // gynae / sexual health — venus symbol
  "venus": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M12 14v7"/><path d="M9 18h6"/></svg>`,

  // neonatal — baby (rocker bassinet style)
  "baby": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3"/><path d="M4 18c0-3 4-5 8-5s8 2 8 5"/><path d="M3 19c2 1.5 4 2 9 2s7-.5 9-2"/><circle cx="10.5" cy="6.8" r="0.5" fill="currentColor"/><circle cx="13.5" cy="6.8" r="0.5" fill="currentColor"/></svg>`,

  // mental / behavioural — head with thought
  "head-mind": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13a7 7 0 1 1 14 0c0 2-1 3-2 3.5V19a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5C7 17 5 15.5 5 13z"/><circle cx="10" cy="11" r="0.8" fill="currentColor"/><circle cx="14" cy="11" r="0.8" fill="currentColor"/><path d="M10.5 14.5h3"/></svg>`,

  // procedures / resources — toolbox
  "tools": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="11" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/><circle cx="12" cy="13" r="1.5"/></svg>`,

  // resources / equity — people (community)
  "people": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 19c0-3 3-5 6-5s6 2 6 5"/><path d="M14 14c3 0 8 1.5 8 5"/></svg>`,

  // generic PDF/document icon for quick-links sidebar entries
  "document": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6M9 9h2"/></svg>`,
};
