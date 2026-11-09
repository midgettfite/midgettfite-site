#!/bin/bash
# After-cutover checks for midgettfite.com (MF-312, 2026-10-28). Read-only.
# Usage: bash check-live.sh            (live domain)
#        bash check-live.sh <host>     (e.g. the bridge's workers.dev URL, before cutover)
H=${1:-midgettfite.com}
fail=0
ok()  { echo "  ok   $*"; }
bad() { echo "  FAIL $*"; fail=1; }

echo "Pages on https://$H"
for p in / /contact/ /helpful-forms/ /meet-the-team/ /payment-portal/ /privacy/ /property-management/ \
         /residential-property-for-rent/ /residential-property-for-sale/ /commercial-property-for-rent/ \
         /commercial-property-for-sale/ /land-for-sale/ /brokerage-service/ /company-history/ /testimonials/; do
  c=$(curl -s -o /dev/null -L -m 15 -w "%{http_code}" "https://$H$p")
  [ "$c" = 200 ] && ok "$p" || bad "$p -> $c"
done

echo "Old Wix addresses land on the right page"
for pair in /dan-midgett:/meet-the-team /forms:/helpful-forms; do
  from=${pair%%:*}; to=${pair##*:}
  loc=$(curl -s -o /dev/null -m 15 -w "%{redirect_url}" "https://$H$from")
  [[ "$loc" == "https://$H$to"* ]] && ok "$from -> $loc" || bad "$from -> '$loc'"
done

echo "Content"
home=$(curl -s -m 15 "https://$H/")
grep -q '24bdcf87-2364-4451-b430-10321f6550bd' <<<"$home" && ok "contact form key (office@)" || bad "contact form key missing"
grep -q 'office@midgettfite.com' <<<"$home" && ok "office@ shown" || bad "office@ not shown"
grep -q 'midgettfite-site.midgett-and-fite' <<<"$home" && bad "page names the workers.dev origin" || ok "no origin URLs in page"

if [ "$H" = midgettfite.com ]; then
  echo "www and email DNS"
  loc=$(curl -s -o /dev/null -m 15 -w "%{redirect_url}" https://www.midgettfite.com/)
  [ "$loc" = "https://midgettfite.com/" ] && ok "www -> apex" || bad "www -> '$loc'"
  [ "$(dig +short midgettfite.com MX | sort | tr '\n' ' ')" = "10 mx.zoho.com. 20 mx2.zoho.com. 50 mx3.zoho.com. " ] && ok "MX = Zoho" || bad "MX changed"
  dig +short midgettfite.com TXT | grep -q 'v=spf1 a mx include:zoho.com include:spf.telnyx.com' && ok "SPF" || bad "SPF changed"
  dig +short _dmarc.midgettfite.com TXT | grep -q 'v=DMARC1' && ok "DMARC" || bad "DMARC missing"
  dig +short zmail._domainkey.midgettfite.com TXT | grep -q 'v=DKIM1' && ok "DKIM" || bad "DKIM missing"
  [ "$(dig +short mail.midgettfite.com A)" = 45.61.169.166 ] && ok "mail. A" || bad "mail. A changed"
  for s in privacy ivy jasper; do
    c=$(curl -s -o /dev/null -m 15 -w "%{http_code}" "https://$s.midgettfite.com/")
    [[ "$c" =~ ^(200|302|401|403)$ ]] && ok "$s.midgettfite.com answers ($c)" || bad "$s.midgettfite.com -> $c"
  done
fi

[ $fail = 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"
exit $fail
