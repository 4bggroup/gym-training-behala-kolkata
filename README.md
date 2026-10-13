# FORM — Story Edition 04 · Ladies Fitness Studio, Behala

A complete long-form, one-page website in plain HTML, CSS and JavaScript.
No build step, framework, package installation or CDN is required.

## Open the website

1. Extract the ZIP fully.
2. Open `form-ladies-fitness/index.html` in a modern browser.
3. Keep the `assets` folder alongside `index.html`.

To upload to normal static hosting, upload the CONTENTS of `form-ladies-fitness`
to your site's web root. The entry file should be `index.html`.

## Separate files

- `index.html` — page content, business details and sample pricing.
- `assets/css/style.css` — layout, colours, typography and responsive rules.
- `assets/css/form.css` — enquiry groups and the connected package picker.
- `assets/css/experience.css` — story controls, training finder, coaching guide,
  comparison table and mobile refinements.
- `assets/css/animations.css` — entrance, ticker and hover motion.
- `assets/js/config.js` — optional enquiry endpoint and timeout.
- `assets/js/motion.js` — expanding training lanes, mobile panel controls,
  projected hero floor, route transitions, studio viewfinder, recovery orbit
  and user-controlled motion.
- `assets/js/app.js` — navigation, training filters, programme dialogs,
  first-day tabs, timetable, membership selection, photo viewer and form.
- `assets/js/experience.js` — manual hero photo stories and the training finder.
- `assets/images/` — 15 selected full-composition WebP photos and SVG favicon.
- `assets/fonts/` — locally hosted URW Gothic and Roboto fonts and their licence.
- `IMAGE-GUIDE.md` — selected image filenames and intended placements.

## Included interactions

- Mobile navigation with keyboard focus handling and Escape support.
- Smooth anchor scrolling and reading-progress indicator.
- Three manual hero stories, each with a different photo and supporting copy.
- A three-question training finder: goal, experience and preferred time.
- Suggested programme, editable answers and one-click transfer into the enquiry.
- Programme filters and detailed programme dialogs.
- Four-step first-day story with keyboard-operable tabs.
- Sample class-timetable tabs.
- Two-way package selection between membership cards and form buttons.
- A visible selected-package price and duration summary.
- Expandable membership comparison with connected selection buttons.
- Grouped personal details and training preferences.
- Native expandable FAQs and enlarged studio photos.
- Responsive mobile enquiry bar.
- The mobile enquiry bar hides while the form has keyboard focus.
- Custom studio motion, a pause-motion control and reduced-motion support.

## Enquiry form

The default form is an honest offline demo. It validates the fields and prepares
a downloadable text summary. It does NOT send email, store personal details in
browser storage, book appointments, process payments or contact the dummy number.

To enable delivery, provide a real secure server endpoint in
`assets/js/config.js` and host the site over HTTPS. The server must accept a
JSON POST with:

    name, phone, email, interest, goal, experience, preferredTime, plan, packagePrice,
    packageDuration, currency, message, consent

It must return a successful HTTP response and JSON:

    {"success": true}

Handle email delivery or database storage on that server. Add server-side
validation, anti-spam measures and any required CORS configuration there.
Do not put private credentials or email-service API keys in the browser files.
The frontend reports delivery only after the successful server receipt. An
error preserves the form so visitors can retry.

The finder suggests a programme to explore from the visitor's chosen goal.
It does not calculate a workout or choose a paid membership. Goal and experience
are optional enquiry metadata. The visitor can still adjust their programme
interest and preferred time in the form. Personal details and the selected
membership are preserved when finder answers are applied. All details stay
in the page until it is closed or reloaded; there is no browser storage.

## Business details

FORM is an illustrative studio concept. The name, address, prices, hours and
class timetable are sample content, and the page labels them accordingly.

- Demo address: 24 Training Lane, Behala, Kolkata 700034.
- Dummy number: +91 00000 00000. No live call or WhatsApp action is attached.
- Monthly: ₹1,499; quarterly: ₹3,999; annual: ₹12,999.
- Personal training: from ₹4,999/month.
- Monday–Saturday: 6 AM–10 PM; Sunday: 8 AM–2 PM.

Before going live, replace the sample details in `index.html` and class times
inside the `schedules` array in `assets/js/app.js`. Replace the live form consent
and privacy information with your studio's approved wording.

The map link searches the Behala locality, not the fictional street address.
There are no invented testimonials, customer counts or trainer qualifications.

## Images and typography

Photos are generated illustrations selected from this project's image session.
WebP encoding preserves their original composition and pixel dimensions.
The pictures illustrate the concept; they do not document real premises or staff.

New fonts: geometric URW Gothic for headings and Roboto for body text.
Fonts are included locally for reliable offline display. Font licence text is
in `assets/fonts/FONT-LICENSE.txt`. Keep it with redistributed font files.

## Verification

Asset paths, anchor destinations, HTML structure and JavaScript syntax were
checked. Interactive behaviour is checked with a DOM-based local harness.
Browser-based visual QA was unavailable in this environment; check the finished
page in your target browsers before publication.

All 48 finder combinations were checked for the correct programme, preserved
personal details and membership, and matching enquiry-download metadata.
Back/Edit, manual time changes, server success/failure, hero-image decoding
races, keyboard story choices and reduced-motion behaviour were also checked.

## Story and layout update in this edition

- Added Strength, Movement and Together hero stories with manual controls.
- Added a route-based training finder between the introduction and programmes.
- Added a coaching approach strip below the four-step first-day story.
- Added an expandable comparison of sample package fees and monthly equivalents.
- Connected comparison, cards and the form to the same membership state.
- Added a visible goal/experience summary to the enquiry form.
- Refined mobile spacing, photo framing and the size of touch controls.
- Added photo-gate motion that cancels when the visitor pauses motion.
- Corrected dropdown markup for packages, programme interests and preferred times.

## Enquiry update in this edition

- Rebuilt the form into membership, personal details and training groups.
- Selecting an outside package scrolls directly to the form and focuses the name field.
- Changing a package inside the form updates the outside card and its selected label.
- The selected name, sample price and duration appear at the top of the form.
- Enquiry downloads and live payloads include the same package and preferred time.
- Editing details invalidates an older preview so a stale enquiry is not downloaded.
- Live servers should verify the plan and calculate their own prices; the client price is illustrative metadata.

## Design and motion edition

- Replaced condensed uppercase headlines with geometric sentence-case type.
- Rebuilt the hero as an offset photographic stage with a projected training floor.
- Replaced the repetitive grid with expanding programme photo lanes on desktop
  and a controlled swipe gallery on mobile.
- Added directional image transitions and a four-stop first-day progress runway.
- Added a studio-photo viewfinder, scroll-linked reset graphic and subtle wordmark movement.
- Reworked spacing, framing, pricing, forms and responsive layouts.
- Removed the looping promotional ticker and generic fade-up reveals.
- Added a user pause control; device reduced-motion settings are respected.

Created by Sourav Show.
