import * as React from 'react';

interface IProps {
  items: any[];
  filterBy: string;
}

// interface IState {}

export default class List extends React.PureComponent<IProps, {}> {
  constructor(props: any, context: any) {
    super(props, context);
  }

  public render() {
    const { items, filterBy } = this.props;
    return (
      <div>
        {items.filter(item => item.indexOf(filterBy) > -1).map((item, i) => <li key={i}>{item}</li>)}
      </div>
    );
  }
}