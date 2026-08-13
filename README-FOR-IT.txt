PFT EDUCATION HUB — STATIC WEBSITE
Respiratory Care Laboratory Section, King Fahad Medical City
====================================================================

WHAT THIS IS
------------
A static website. Plain HTML, CSS and JavaScript that runs entirely in
the visitor's browser.

  index.html            the site (all 22 sections)
  assets/site.css       styling
  assets/site.js        navigation, search, self-test, checklist
  assets/*.png|svg      icons
  manifest.webmanifest  lets staff add it to a phone home screen
  sw.js                 offline caching (network-first)

Total size: under 200 KB.


WHAT IT DOES NOT NEED
---------------------
  - No server-side code. No PHP, no .NET, no Node, no CGI.
  - No database.
  - No application pool configuration beyond serving static files.
  - No outbound network calls. No CDN, no external fonts, no
    analytics, no third-party scripts. Verified: the source contains
    zero external http/https references.
  - No cookies and no localStorage. The service worker caches the
    site's own files so it opens without a signal; it stores no user
    data and makes no third-party requests.
  - No user data is collected, transmitted or stored anywhere.
  - No authentication logic of its own — it inherits whatever access
    control the hosting location provides.


TO DEPLOY
---------
Copy the whole folder, keeping the structure intact, into a directory
served by the web server. For example:

  IIS      C:\inetpub\wwwroot\pft-hub\
  Apache   /var/www/html/pft-hub/

Confirm the default document includes index.html (it does by default
on both IIS and Apache).

The site is then reachable at, for example:

  http://intranet.kfmc.med.sa/pft-hub/

That is the URL to link from the SharePoint page. No virtual
directory, MIME type or handler mapping changes are required — .html,
.css, .js and .svg are all served correctly out of the box.

Keep assets/ in the same folder as index.html. The paths are relative,
so the site works from any subdirectory and from any hostname.


ACCESS CONTROL
--------------
The content is internal staff education, not patient data, but it
should not be publicly reachable. Please restrict it to the internal
network, or apply Windows Authentication on the directory if that is
the site standard.


UPDATES
-------
Updates are a file replacement — no rebuild, no restart, no downtime.
Please advise which of these you prefer:

  a) the section maintainer has write access to the folder, or
  b) updates are submitted to IT for replacement

Option (a) is preferred if it fits policy. The content is clinical
reference material that occasionally needs same-day correction.


NOTE ON HTTPS
-------------
The offline caching registers only over HTTPS. Over plain http the
site works normally, just without offline support. Nothing breaks
either way.


BROWSER SUPPORT
---------------
Any current browser: Edge, Chrome, Firefox, Safari. Works on phones
and tablets. Prints cleanly to PDF, all sections expanded.


CONTACT
-------
Mohammed — Respiratory Care Laboratory Section
