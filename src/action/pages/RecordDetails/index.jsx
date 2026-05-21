import { useEffect } from 'react'

import { useRecordById } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../../shared/context/RouterContext'
import { RecordDetails as RecordDetailsContainer } from '../../containers/RecordDetails/RecordDetails'

export const RecordDetails = () => {
  const { params, navigate } = useRouter()

  const { data: record } = useRecordById({
    variables: { id: params.recordId }
  })

  const handleCollapseRecordDetails = () => {
    if (params.source === 'authenticator') {
      navigate('authenticator')
    } else {
      navigate('vault', { state: { recordType: 'all' } })
    }
  }

  useEffect(() => {
    if (!record) {
      handleCollapseRecordDetails()
    }
  }, [record])

  if (!record) {
    return null
  }

  return <RecordDetailsContainer />
}
