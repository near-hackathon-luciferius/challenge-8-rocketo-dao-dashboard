import React from 'react'
import Image404 from '../images/404.jpg';

class NotFound extends React.Component {
   render() {
      return <img src={Image404} alt="Nothing is here." 
                  width='900'
                  style={{margin:'10em'}}/>;
   }
}
export default NotFound;