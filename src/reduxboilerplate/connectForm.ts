import {
  connect
} from "react-redux";


export const connectForm = <S,T>(a: (state: any)=>S, b: (dispatch:any)=>T) => (c: any) => {
  return connect<S, T>( a, b, null, {forwardRef: true})(c);
}
