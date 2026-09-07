import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectUi } from '../store/slices/uiSlice'
import { translate } from '../i18n/translations'

export default function useTranslation() {
  const { language } = useSelector(selectUi)
  const t = useCallback((key) => translate(language, key), [language])
  return { t, language }
}
