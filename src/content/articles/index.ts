import type { Article } from './_types'
import _balloon_sinuplasty_vs_traditional_sinus_surgery_a_comparison_of_safety_and_recovery_time from './balloon-sinuplasty-vs-traditional-sinus-surgery-a-comparison-of-safety-and-recovery-time'
import _balloon_sinuplasty_vs_traditional_sinus_surgery_which_is_right_for_you from './balloon-sinuplasty-vs-traditional-sinus-surgery-which-is-right-for-you'
import _beat_the_heat_and_sinusitis_discover_the_best_foods_and_drinks_for_relief_in_warm_weather from './beat-the-heat-and-sinusitis-discover-the-best-foods-and-drinks-for-relief-in-warm-weather'
import _breathing_easy_again_overcoming_chronic_sinusitis_with_lifestyle_changes_and_medical_interventions from './breathing-easy-again-overcoming-chronic-sinusitis-with-lifestyle-changes-and-medical-interventions'
import _managing_seasonal_changes_transitioning_your_chronic_sinus_care_for_fall from './managing-seasonal-changes-transitioning-your-chronic-sinus-care-for-fall'
import _sinusitis_facts_vs_fiction_debunking_common_myths from './sinusitis-facts-vs-fiction-debunking-common-myths'
import _sinusitis_in_children_understanding_the_causes_treatment_and_prevention_of_this_common_condition from './sinusitis-in-children-understanding-the-causes-treatment-and-prevention-of-this-common-condition'
import _spring_allergy_proof_your_home_tips_for_a_healthy_indoor_environment from './spring-allergy-proof-your-home-tips-for-a-healthy-indoor-environment'
import _spring_cleaning_for_sinus_health_tips_for_clearing_out_irritants_in_your_home from './spring-cleaning-for-sinus-health-tips-for-clearing-out-irritants-in-your-home'
import _the_allergy_sinusitis_connection_effective_strategies_for_symptom_management from './the-allergy-sinusitis-connection-effective-strategies-for-symptom-management'
import _title_top_10_spring_allergy_friendly_activities_for_outdoor_enthusiasts from './title-top-10-spring-allergy-friendly-activities-for-outdoor-enthusiasts'
import _traveling_with_sinusitis_tips_for_managing_symptoms_on_the_road from './traveling-with-sinusitis-tips-for-managing-symptoms-on-the-road'
import _understanding_spring_allergies_a_comprehensive_guide from './understanding-spring-allergies-a-comprehensive-guide'
import _weathering_sinusitis_coping_strategies_for_seasonal_changes_and_symptom_relief from './weathering-sinusitis-coping-strategies-for-seasonal-changes-and-symptom-relief'

export type { Article, ArticleBlock } from './_types'

export const ARTICLES: Article[] = [
  _balloon_sinuplasty_vs_traditional_sinus_surgery_a_comparison_of_safety_and_recovery_time,
  _balloon_sinuplasty_vs_traditional_sinus_surgery_which_is_right_for_you,
  _beat_the_heat_and_sinusitis_discover_the_best_foods_and_drinks_for_relief_in_warm_weather,
  _breathing_easy_again_overcoming_chronic_sinusitis_with_lifestyle_changes_and_medical_interventions,
  _managing_seasonal_changes_transitioning_your_chronic_sinus_care_for_fall,
  _sinusitis_facts_vs_fiction_debunking_common_myths,
  _sinusitis_in_children_understanding_the_causes_treatment_and_prevention_of_this_common_condition,
  _spring_allergy_proof_your_home_tips_for_a_healthy_indoor_environment,
  _spring_cleaning_for_sinus_health_tips_for_clearing_out_irritants_in_your_home,
  _the_allergy_sinusitis_connection_effective_strategies_for_symptom_management,
  _title_top_10_spring_allergy_friendly_activities_for_outdoor_enthusiasts,
  _traveling_with_sinusitis_tips_for_managing_symptoms_on_the_road,
  _understanding_spring_allergies_a_comprehensive_guide,
  _weathering_sinusitis_coping_strategies_for_seasonal_changes_and_symptom_relief,
].sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function getArticles(opts?: { page?: number; limit?: number; category?: string }): { docs: Article[]; totalPages: number; page: number } {
  const page = Math.max(1, opts?.page ?? 1)
  const limit = opts?.limit ?? 9
  const filtered = opts?.category ? ARTICLES.filter((a) => a.category === opts.category) : ARTICLES
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const start = (page - 1) * limit
  return { docs: filtered.slice(start, start + limit), totalPages, page }
}
