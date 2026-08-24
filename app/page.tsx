import Link from 'next/link'
import Navbar from '@/components/Navbar'
import HeroIllustration from '@/components/HeroIllustration'

const features = [
  {
    id: 'securite',
    title: 'Confiance',
    description: 'Vérification KYC complète + casier judiciaire pour chaque membre de la communauté.',
    icon: (
      <path
        d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    id: 'serenite',
    title: 'Sérénité',
    description: 'Visioconférence obligatoire avant chaque mission pour se rencontrer en toute confiance.',
    icon: (
      <>
        <rect x="3" y="7" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M15 10.5l6-3v9l-6-3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      </>
    ),
  },
  {
    id: 'communaute',
    title: 'Communauté',
    description: 'Plus de 10 000 particuliers vérifiés déjà actifs sur la plateforme.',
    icon: (
      <>
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <circle cx="17" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M14.5 19c.4-2.2 1.9-3.8 3.9-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
]

const steps = [
  {
    title: 'Inscription & Vérification',
    description: 'Créez votre compte et validez votre identité via notre parcours KYC sécurisé.',
  },
  {
    title: 'Parcourir les missions ou candidats',
    description: "Explorez les profils vérifiés et trouvez la personne ou la mission qui vous correspond.",
  },
  {
    title: 'Visioconférence obligatoire',
    description: 'Échangez en visio avant toute mission pour confirmer la confiance mutuelle.',
  },
  {
    title: 'Contrat numérique',
    description: 'Signez un contrat clair et conforme, généré automatiquement pour chaque mission.',
  },
  {
    title: 'Paiement sécurisé',
    description: 'Le paiement est protégé et déclaré automatiquement, en toute légalité (URSSAF).',
  },
]

const stats = [
  { value: '19 000+', label: 'missions réalisées' },
  { value: '50 000€', label: 'en volume échangé' },
  { value: '95%', label: 'de satisfaction' },
]

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500 text-xs font-bold text-white">
                  O
                </span>
                OMLIINK
              </div>

              <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl md:text-[3.25rem]">
                Connectez-vous avec des particuliers de{' '}
                <span className="text-indigo-600">confiance</span>
              </h1>

              <p className="mt-4 text-base font-medium text-gray-600 sm:text-lg">
                100% Légal • 100% Vérifié • 100% Confiance
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="w-full rounded-lg bg-indigo-500 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                  Commencer Gratuitement
                </Link>
                <a
                  href="#comment-ca-marche"
                  className="w-full rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
                >
                  En Savoir Plus
                </a>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-md">
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="fonctionnalites" className="border-t border-gray-100 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Pourquoi choisir OMLIINK</h2>
              <p className="mt-3 text-base text-gray-600">
                Une plateforme pensée pour la confiance, à chaque étape.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  id={feature.id}
                  className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="comment-ca-marche" className="border-t border-gray-100 bg-gray-50 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Comment ça marche</h2>
              <p className="mt-3 text-base text-gray-600">Cinq étapes simples, encadrées et sécurisées.</p>
            </div>

            <ol className="relative mt-12 space-y-10 border-l border-gray-200 pl-8">
              {steps.map((step, index) => (
                <li key={step.title} className="relative">
                  <span className="absolute -left-[calc(2rem+1px)] flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white ring-4 ring-gray-50">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-gray-100 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-8 rounded-2xl bg-indigo-500 px-6 py-12 text-center sm:grid-cols-3 sm:px-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-indigo-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-gray-100 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Rejoindre OMLIINK Maintenant</h2>
            <p className="mt-3 text-base text-gray-600">
              Créez votre compte gratuitement et rejoignez une communauté de confiance.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/signup"
                className="w-full rounded-lg bg-[#ff5a3d] px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#ff5a3d]/90 focus:outline-none focus:ring-2 focus:ring-[#ff5a3d] focus:ring-offset-2 sm:w-auto"
              >
                Rejoindre OMLIINK Maintenant
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500 text-xs font-bold text-white">
                  O
                </span>
                OMLIINK
              </Link>
              <p className="mt-3 text-sm text-gray-600">
                La plateforme de services entre particuliers, légale et vérifiée.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Produit</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><a href="#fonctionnalites" className="hover:text-indigo-600">Fonctionnalités</a></li>
                <li><a href="#comment-ca-marche" className="hover:text-indigo-600">Comment ça marche</a></li>
                <li><a href="#securite" className="hover:text-indigo-600">Sécurité</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Légal</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><Link href="/cgu" className="hover:text-indigo-600">CGU</Link></li>
                <li><Link href="/politique-confidentialite" className="hover:text-indigo-600">Politique de confidentialité</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><Link href="/contact" className="hover:text-indigo-600">Nous contacter</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} OMLIINK. Tous droits réservés.
          </div>
        </div>
      </footer>
    </>
  )
}
