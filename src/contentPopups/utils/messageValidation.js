
export const isMessageOriginValid = (msg, eventOrigin) => {
    if (!msg?.data?.url) {
        return true
    }

    try {
        const urlOrigin = new URL(msg.data.url).origin
        if (urlOrigin !== eventOrigin) {
            console.warn(
                'Security Warning: Message origin does not match URL origin',
                {
                    messageOrigin: eventOrigin,
                    urlOrigin: urlOrigin
                }
            )
            return false
        }
        return true
    } catch (error) {
        console.error('Error validating message origin:', error)
        return false
    }
}