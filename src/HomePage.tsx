import {
  DataGridPremium,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowsProp,
  GridSortModel,
  GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid-premium";
import { useSearchParams } from "react-router-dom";
import sortBy from "sort-by";
import { useEffect, useState, useLayoutEffect } from "react";

const columns: GridColDef[] = [
  { field: "col1", headerName: "Column 1", width: 150 },
  { field: "col2", headerName: "Column 2", width: 150 },
];

enum SearchParamNames {
  SortModel = "sortModel",
  PaginationModel = "paginationModel",
  FilterModel = "filterModel",
}

const convertSortModalToBackendSort = (sortModel: GridSortModel) => {
  if (sortModel.length > 0) {
    const { sort, field } = sortModel[0];
    const isDesc = sort === "desc";
    return `${isDesc ? "-" : ""}${field}`;
  }
  return undefined;
};

const convertFilterModalToBackendFilters = (filterModel: GridFilterModel) => {
  if (filterModel.items.length > 0) {
    return filterModel.items.reduce((acc, item) => {
      return {
        ...acc,
        [item.field]: item.value,
      };
    }, {});
  }
  return undefined;
};

const rows: GridRowsProp = [
  { id: 1, col1: "Hello", col2: "World" },
  { id: 2, col1: "Gen", col2: "is Awesome" },
  { id: 3, col1: "four", col2: "is Amazing" },
  { id: 4, col1: "rRdf", col2: "firwff" },
  { id: 5, col1: "MUI2", col2: "maple" },
  { id: 6, col1: "Hello", col2: "World" },
  { id: 7, col1: "Svgg", col2: "F savage" },
  { id: 8, col1: "ff", col2: "irundal" },
  { id: 9, col1: "DataGridPro2", col2: "icarir" },
  { id: 10, col1: "arch", col2: "horosh" },
  { id: 11, col1: "rok", col2: "noob" },
];

type Data = {
  data: GridValidRowModel[];
  count: number;
};

const fetchRows = async (params: {
  offset: number;
  limit: number;
  sort?: string;
  filter?: Record<string, string>;
}): Promise<Data> => {
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, 2000),
  );
  const { offset, limit, sort, filter = {} } = params;

  const filteredRows = rows.filter((row) => {
    const keys = Object.keys(filter);
    return keys.every((key) => !row[key] || row[key].includes(filter[key]));
  });

  const sortedRows = [...filteredRows];

  if (sort) {
    sortedRows.sort(sortBy(sort));
  }

  // I don't paginate rows when limit is zero
  const paginatedRows =
    limit === 0 ? sortedRows : sortedRows.slice(offset, offset + limit);

  return {
    count: filteredRows.length,
    data: paginatedRows,
  };
};
export const HomePage = () => {
  const {
    paginationModel,
    setPaginationModel,
    filterModel,
    setFilterModel,
    sortModel,
    setSortModel,
    goToPage,
  } = useDataGridUrlState();

  const { page, pageSize } = paginationModel;
  const apiRef = useGridApiRef();

  const [data, setData] = useState<Data | null>(null);
  const [previousData, setPreviousData] = useState<Data | null>(null);

  const [loading, setLoading] = useState(false);

  const params = {
    offset: page * pageSize,
    limit: pageSize,
    filter: convertFilterModalToBackendFilters(filterModel),
    sort: convertSortModalToBackendSort(sortModel),
  };

  console.log("params", params);

  useEffect(() => {
    setLoading(true);
    fetchRows(params)
      .then(setData)
      .finally(() => {
        setLoading(false);
      });
  }, [JSON.stringify(params)]);

  if (data !== null && !Object.is(previousData, data)) {
    setPreviousData(data);
  }

  const rows = (data || previousData)?.data || [];
  const rowCount = (data || previousData)?.count || 0;

  const totalPages = pageSize ? Math.ceil(rowCount / pageSize) : 1;

  useLayoutEffect(() => {
    return apiRef?.current.subscribeEvent("viewportInnerSizeChange", () => {
      const dimensions = apiRef.current.getRootDimensions();

      const computedPageSize = Math.floor(
        dimensions.viewportInnerSize.height / dimensions.rowHeight,
      );

      console.log("page", computedPageSize);

      setPaginationModel({
        page,
        pageSize: computedPageSize,
      });
    });
  }, [apiRef]);

  return (
    <div>
      <div
        style={{
          marginBottom: 10,
        }}
      >
        {!!rowCount && (
          <div style={{ display: "flex", gap: 20 }}>
            <Pagination
              max={totalPages}
              page={page + 1}
              onPageChange={(page) => goToPage(page - 1)}
            />
            <HelperPaginationText
              count={rowCount}
              page={page + 1}
              pageSize={pageSize || rowCount}
            />
          </div>
        )}
      </div>
      <DataGridPremium
        apiRef={apiRef}
        sx={{
          height: 300,
        }}
        rowCount={rowCount}
        pagination
        loading={loading}
        hideFooterPagination
        hideFooter
        paginationMode={"server"}
        filterMode={"server"}
        sortingMode={"server"}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        disableMultipleColumnsSorting
        headerFilters
        rows={rows}
        columns={columns}
      />
    </div>
  );
};

const HelperPaginationText = ({
  count,
  page,
  pageSize,
}: {
  count: number;
  page: number;
  pageSize: number;
}) => {
  return (
    <div>
      Showing {(page - 1) * pageSize + 1}-{Math.min(count, page * pageSize)} out
      of {count} records &nbsp;
    </div>
  );
};

const Pagination = ({
  min = 1,
  max = Infinity,
  page,
  onPageChange,
}: {
  min?: number;
  max?: number;
  page: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div>
      <button
        onClick={() => {
          if (page === min) {
            return;
          }
          onPageChange(page - 1);
        }}
      >
        &lt;
      </button>
      <span>&nbsp;Page&nbsp;</span>
      <span>{page}</span>

      <span>&nbsp;out of {max}&nbsp;</span>
      <button
        onClick={() => {
          if (page >= max) {
            return;
          }
          onPageChange(page + 1);
        }}
      >
        &gt;
      </button>
    </div>
  );
};

const useDataGridUrlState = (
  props: {
    page?: number;
    pageSize?: number;
  } = {},
) => {
  const { page = 0, pageSize = 25 } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  // eslint-disable-next-line
  const serialize = (data: any) => JSON.stringify(data);
  const deserialize = (string: string) => JSON.parse(string);

  const setSortModel = (model: GridSortModel) => {
    if (model.length) {
      searchParams.set(SearchParamNames.SortModel, serialize(model));
    } else {
      searchParams.delete(SearchParamNames.SortModel);
    }

    setSearchParams(searchParams);
  };

  const serializedSortModel = searchParams.get(SearchParamNames.SortModel);

  const sortModel: GridSortModel = serializedSortModel
    ? deserialize(serializedSortModel)
    : [];

  const setFilterModel = (model: GridFilterModel) => {
    searchParams.delete(SearchParamNames.PaginationModel);
    if (!model.items.length) {
      searchParams.delete(SearchParamNames.FilterModel);
    } else {
      searchParams.set(SearchParamNames.FilterModel, serialize(model));
    }
    setSearchParams(searchParams);
  };

  const serializedFilterModel = searchParams.get(SearchParamNames.FilterModel);

  const filterModel: GridFilterModel = serializedFilterModel
    ? deserialize(serializedFilterModel)
    : {
        items: [],
      };

  const setPaginationModel = (model: GridPaginationModel) => {
    searchParams.set(SearchParamNames.PaginationModel, serialize(model));

    setSearchParams(searchParams);
  };

  const serializedPaginationModel = searchParams.get(
    SearchParamNames.PaginationModel,
  );
  const paginationModel: GridPaginationModel = serializedPaginationModel
    ? deserialize(serializedPaginationModel)
    : {
        page,
        pageSize,
      };

  const goToPage = (page: number) => {
    searchParams.set(
      SearchParamNames.PaginationModel,
      serialize({
        ...paginationModel,
        page,
      }),
    );
    setSearchParams(searchParams);
  };

  return {
    sortModel,
    setSortModel,
    paginationModel,
    setPaginationModel,
    filterModel,
    setFilterModel,
    goToPage,
  };
};
