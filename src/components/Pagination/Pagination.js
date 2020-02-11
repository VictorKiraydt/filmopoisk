import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import "./style.css";

const propTypes = {
  items: PropTypes.array.isRequired,
  onChangePage: PropTypes.func.isRequired,
  initialPage: PropTypes.number,
  pageSize: PropTypes.number
};

const defaultProps = {
  initialPage: 1,
  pageSize: 10
};

class Pagination extends Component {
  state = {
    pager: {}
  };

  UNSAFE_componentWillMount() {
    if (this.props.items && this.props.items.length) {
      this.setPage(this.props.initialPage);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(this.props.items, prevProps.items)) {
      this.setPage(this.props.initialPage);
    }
  }

  setPage(page) {
    const { items, pageSize } = this.props;
    let { pager } = this.state;

    if (page < 1 || page > pager.totalPages) {
      return;
    }

    // NOTE: Get new pager object for specified page
    pager = this.getPager(items.length, page, pageSize);
    // NOTE: Get new page of items from items array
    const pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

    this.props.onChangePage(pageOfItems);
    this.setState({ pager });
  }

  getPager(totalItems, currentPage, pageSize) {
    currentPage = currentPage || 1;
    pageSize = pageSize || 10;

    const totalPages = Math.ceil(totalItems / pageSize);
    let startPage, endPage;

    if (totalPages <= 10) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    // NOTE: calculate start and end item indexes
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // NOTE: create an array of pages in the pager control
    const pages = [...Array(endPage + 1 - startPage).keys()].map(
      i => startPage + i
    );

    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }

  render() {
    const { pager } = this.state;

    if (!pager.pages || pager.pages.length <= 1) {
      return null;
    }

    return (
      <ul className="pagination">
        <li className={pager.currentPage === 1 ? "disabled" : ""}>
          <button onClick={() => this.setPage(1)}>First</button>
        </li>
        <li className={pager.currentPage === 1 ? "disabled" : ""}>
          <button onClick={() => this.setPage(pager.currentPage - 1)}>
            Prev
          </button>
        </li>
        {pager.pages.map((page, index) => (
          <li
            key={index}
            className={pager.currentPage === page ? "active" : ""}
          >
            <button onClick={() => this.setPage(page)}>{page}</button>
          </li>
        ))}
        <li
          className={pager.currentPage === pager.totalPages ? "disabled" : ""}
        >
          <button onClick={() => this.setPage(pager.currentPage + 1)}>
            Next
          </button>
        </li>
        <li
          className={pager.currentPage === pager.totalPages ? "disabled" : ""}
        >
          <button onClick={() => this.setPage(pager.totalPages)}>Last</button>
        </li>
      </ul>
    );
  }
}

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;
export default Pagination;
