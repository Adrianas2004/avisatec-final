import "react-native-url-polyfill/auto";

import "react-native-get-random-values";

import { Amplify } from "aws-amplify";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  cognitoUserPoolsTokenProvider,
} from "aws-amplify/auth/cognito";

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  AsyncStorage
);

Amplify.configure({

  Auth: {

    Cognito: {

      userPoolId: "us-east-1_CHVp0vin8",

      userPoolClientId:
        "1i41d3ribr7kb96ohkv06997u",

      loginWith: {
        email: true,
      },

    },

  },

});