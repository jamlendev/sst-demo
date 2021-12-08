
export default {
    getAccountId: function(authProvider: any) {
        const p = authProvider.amr.find((x: string) => x.includes('CognitoSignIn'))
        // Cognito authentication provider looks like:
        // cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
        // Where us-east-1_aaaaaaaaa is the User Pool id
        // And qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr is the User Pool User Id
        const parts = p.split(':')
        // const userPoolIdParts = parts[parts.length - 3].split('/')

        // const userPoolId = userPoolIdParts[userPoolIdParts.length - 1]
        const userPoolUserId = parts[parts.length - 1]

        return userPoolUserId
    }
}
