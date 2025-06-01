# Ngram Viewer – Nasjonalbiblioteket

En moderne og interaktiv webapplikasjon for utforsking av ordhyppighet i Nasjonalbibliotekets digitale samlinger. Verktøyet lar brukere analysere og visualisere hvordan ordbruk har utviklet seg over tid – både i bøker og aviser.

## Funksjoner

### Interaktiv analyse av ordhyppighet
- Søk etter flere ord samtidig  
- Sammenlign hyppighet på tvers av korpus (bøker og aviser)  
- Støtte for flere språk (bokmål, nynorsk, samiske språk og kvensk)  
- Visualiseringen oppdateres i sanntid  

### Avanserte visualiseringsvalg
- Relativ frekvensvisning  
- Absolutt frekvensvisning  
- Kumulativ frekvens  
- Kohortanalyse for sammenligning av andeler  
- Jevn visualisering med justerbare årstall  
- Zoom og pan direkte i grafen  

### Brukervennlig grensesnitt
- Rent, moderne design  
- Intuitiv dra-for-å-zoome-funksjon  
- Støtte for berøringsenheter  
- Responsivt oppsett som fungerer på alle skjermstørrelser  
- Enkel språk- og korpusvelger  

### Eksportmuligheter
- Last ned visualisering som PNG  
- Eksporter data som CSV  
- Eksporter til Excel-regneark  

## Teknisk

### Bygget med
- React  
- Chart.js for visualisering  
- React-Bootstrap for brukergrensesnitt  
- DH-Lab API for ngram-data  

### Nøkkelfunksjoner
- Årsbegrensning (1810–2025) for konsistens  
- Glattemetode for trendvisning  
- Store/små bokstav-sensitivt søk  
- Flerespråklig støtte og lokaltilpasning  
- Mobil- og desktopvennlig  

## Utvikling

### Forutsetninger
- node >= 14.0.0  
- npm >= 6.14.0  

### Installasjon

```bash
# Klon prosjektet
git clone https://github.com/Yoonsen/ngram-pwa-new.git

# Installer avhengigheter
cd ngram-pwa-new
npm install

# Start utviklingsserver
npm start
````

### Bygg for produksjon

```bash
npm run build
```

## Om utviklingen

Dette prosjektet er et samarbeid mellom utviklere og AI-verktøy:

* Den første konverteringen fra Python/Dash/Plotly til React/JavaScript ble assistert av Cursor AI
* Løpende utvikling og forbedringer ble gjort i samspill med ChatGPT
* Design og funksjonalitet ble raffinert av mennesker
* Kvalitet og beste praksis ble opprettholdt i AI-menneske-samarbeid

AI har vært til hjelp i:

* Kodebase-migrering
* Implementering av funksjoner
* Optimalisering
* Adopsjon av beste praksis
* Feilsøking

## Takk til

* DH-Lab ved Nasjonalbiblioteket for ngram-API
* Cursor AI for hjelp i konvertering og utvikling
* ChatGPT for programmeringsassistanse
* Åpen kildekode-fellesskapet for verktøy og biblioteker

## Lisens

Prosjektet er lisensiert under MIT-lisensen – se `LICENSE`-filen for detaljer.

🇬🇧 [English](README.md) | 🇳🇴 [Norsk](README.no.md)


