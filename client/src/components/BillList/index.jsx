import React from 'react';
import Bill from './../Bill';

class BillList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      billList: [],
    };
  }

  // componentDidMount() {
  //   const context = this;
  //   //make api call
  //   const data = this.requestFeedData(context.props.currentFeed);
  //   data.done(results => {
  //     context.setState({
  //       billList: results
  //     });
  //   });
  // }


  // componentDidUpdate(previousProps, previousState) {
  //   if (previousProps.currentFeed !== this.props.currentFeed) {
  //     const context = this;
  //     const data = this.requestFeedData(context.props.currentFeed);
  //     data.done(results => {
  //       context.setState({
  //         billList: results
  //       });
  //     });
  //   }
  // }

  render() {
    return (
      <div>
        {
          this.state.billList.map((bill, index) =>
            <Bill key={index} bill={bill}/>
          )
        }
      </div>
    );
  }

  // //request feed from server
  // requestFeedData(id) {
  //   return $.ajax({
  //     url: `/channel/${id}`,
  //     method: 'GET',
  //     dataType: 'JSON',
  //   });
  // }

}

export default BillList;
