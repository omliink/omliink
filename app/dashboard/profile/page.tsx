import { redirect } from 'next/navigation'
import VerificationBanner from '@/components/dashboard/VerificationBanner'
import VerificationBadge from '@/components/ui/VerificationBadge'
import StripeConnectSection from '@/components/dashboard/StripeConnectSection'
import PhotoBlock from '@/components/dashboard/profile-blocks/PhotoBlock'
import PasswordBlock from '@/components/dashboard/profile-blocks/PasswordBlock'
import CandidateInfoBlock from '@/components/dashboard/profile-blocks/CandidateInfoBlock'
import CandidateStatusBlock from '@/components/dashboard/profile-blocks/CandidateStatusBlock'
import CandidateServicesBlock from '@/components/dashboard/profile-blocks/CandidateServicesBlock'
import CandidateExperienceBlock from '@/components/dashboard/profile-blocks/CandidateExperienceBlock'
import CandidateBioBlock from '@/components/dashboard/profile-blocks/CandidateBioBlock'
import EmployerInfoBlock from '@/components/dashboard/profile-blocks/EmployerInfoBlock'
import EmployerBioBlock from '@/components/dashboard/profile-blocks/EmployerBioBlock'
import { updateCandidatePhoto, updateEmployerPhoto } from '@/lib/actions/profile'
import {
  getCandidateLanguages,
  getCandidateProfile,
  getCandidateServiceCategoryIds,
  getCandidateSkillRows,
  getCandidateSupplementCodes,
  getCategories,
  getCurrentUser,
  getEmployerProfile,
  getProfile,
  getSkillTaxonomy,
} from '@/lib/dashboard-data'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)
  if (!profile) {
    redirect('/dashboard/onboarding')
  }

  const [candidateProfile, employerProfile] = await Promise.all([
    profile.is_candidate ? getCandidateProfile(user.id) : Promise.resolve(null),
    profile.is_employer ? getEmployerProfile(user.id) : Promise.resolve(null),
  ])

  if ((profile.is_candidate && !candidateProfile) || (profile.is_employer && !employerProfile)) {
    redirect('/dashboard/onboarding')
  }

  const [languages, categoryIds, supplementCodes, skillRows, categories, skillTaxonomy] = profile.is_candidate
    ? await Promise.all([
        getCandidateLanguages(user.id),
        getCandidateServiceCategoryIds(user.id),
        getCandidateSupplementCodes(user.id),
        getCandidateSkillRows(user.id),
        getCategories(),
        getSkillTaxonomy(),
      ])
    : [[], [], [], [], [], []]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
        <p className="mt-1 text-sm text-gray-600">Ces informations sont visibles par vos interlocuteurs sur OMLIINK.</p>
      </div>

      {profile.is_candidate && candidateProfile && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Profil candidat</h2>
            <VerificationBadge status={candidateProfile.verification_status} />
          </div>

          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Vérification de profil</h2>
            <div className="mt-4">
              {candidateProfile.verification_status === 'unverified' ? (
                <VerificationBanner />
              ) : (
                <p className="text-sm text-gray-600">
                  Statut actuel : <VerificationBadge status={candidateProfile.verification_status} />
                </p>
              )}
            </div>
          </section>

          <PhotoBlock
            title="Photo"
            photoUrl={candidateProfile.photo_url}
            benefits={[
              'Les profils avec photo reçoivent bien plus de réponses',
              'Rassure les employeurs avant l’entretien visio',
              'Renforce la confiance sur la plateforme',
            ]}
            action={updateCandidatePhoto}
          />

          <CandidateInfoBlock profile={profile} candidateProfile={candidateProfile} languages={languages} />

          <CandidateStatusBlock employmentStatus={candidateProfile.employment_status} />

          <CandidateServicesBlock
            categories={categories}
            skillTaxonomy={skillTaxonomy}
            initialCategoryIds={categoryIds}
            initialSupplementCodes={supplementCodes}
            initialSkills={skillRows.map((row) => ({ category_id: row.category_id, skill_tag: row.skill_tag }))}
          />

          <CandidateExperienceBlock
            experienceLevel={candidateProfile.experience_level}
            hourlyRate={candidateProfile.hourly_rate}
            employmentStatus={candidateProfile.employment_status}
          />

          <CandidateBioBlock bioTitle={candidateProfile.bio_title} bioText={candidateProfile.bio_text} />

          <PasswordBlock />

          <StripeConnectSection profile={candidateProfile} />
        </section>
      )}

      {profile.is_employer && employerProfile && (
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-gray-900">Profil employeur</h2>

          <PhotoBlock
            title="Photo"
            photoUrl={employerProfile.photo_url}
            benefits={[
              'Rassure les candidats avant l’entretien visio',
              'Renforce la confiance sur la plateforme',
              'Facultative — vous pouvez la passer',
            ]}
            action={updateEmployerPhoto}
          />

          <EmployerInfoBlock
            companyName={employerProfile.company_name}
            nationality={employerProfile.nationality}
            phone={profile.phone}
          />

          <EmployerBioBlock bio={employerProfile.bio} />

          <PasswordBlock />
        </section>
      )}
    </div>
  )
}
