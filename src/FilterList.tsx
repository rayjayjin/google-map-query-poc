import * as React from 'react';
import { connect } from 'react-redux';

import List from './List';

interface IProps {
  updateFilter: () => void;
  filterBy: string;
}

// interface IState {
//   filterBy: string;
// }

const initialState = {
  filterBy: '',
};

export const setFilter = (by: any) => {
  return {
    by,
    type: 'SET_FILTER',
  };
}

export const reducer = (state = initialState, action: any) => {
  switch(action.type) {
    case 'SET_FILTER':
      return Object.assign({}, state, {
        filterBy: action.by,
      });
    default:
      return state;
  }
}

// const store = createStore(reducer);

export class FilterList extends React.PureComponent<IProps, {}> {
  // private unsubscribe: any;
  constructor(props: any, context: any) {
    super(props, context);
    // this.state = {
    //   filterBy: '',
    // };
    // this.state = store.getState();
    // this.unsubscribe = store.subscribe(() => {
    //   this.setState(store.getState());
    // });
  }

  // public componentWillUnmount() {
  //   this.unsubscribe();
  // }

  // public updateFilter = (e: any) => {
    // this.setState({ filterBy: e.target.value });
    // store.dispatch(setFilter(e.target.value));
  // }

  public render() {
    // const { filterBy } = this.state;
    const { filterBy, updateFilter } = this.props;
    const framework = ['React', 'Angular', 'Vue', 'Ember'];

    return (
      <div>
        <input type="text" onChange={updateFilter} />
        <List items={framework} filterBy={filterBy} />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    filterBy: state.filterBy,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateFilter: (e: any) => dispatch(setFilter(e.target.value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FilterList);