import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import uuidv4 from 'uuid/v4';

import DataFilesBreadcrumbs from '../DataFilesBreadcrumbs/DataFilesBreadcrumbs';
import DataFilesModalListingTable from './DataFilesModalTables/DataFilesModalListingTable';
import DataFilesModalSelectedTable from './DataFilesModalTables/DataFilesModalSelectedTable';

const DataFilesMoveModal = React.memo(() => {
  const history = useHistory();
  const location = useLocation();

  const dispatch = useDispatch();
  const params = useSelector(
    state => state.files.params.FilesListing,
    shallowEqual
  );
  const modalParams = useSelector(
    state => state.files.params.modal,
    shallowEqual
  );

  const reloadPage = () => {
    history.push(location.pathname);
    dispatch({
      type: 'FETCH_FILES_MODAL',
      payload: { ...modalParams, section: 'modal' }
    });
  };

  const files = useSelector(state => state.files.listing.modal, shallowEqual);
  const isOpen = useSelector(state => state.files.modals.move);
  const selectedFiles = useSelector(
    state =>
      state.files.selected.FilesListing.map(i => ({
        ...state.files.listing.FilesListing[i],
        id: uuidv4()
      })),
    () => true
  );
  const selected = useMemo(() => selectedFiles, [isOpen]);
  const status = useSelector(
    state => state.files.operationStatus.move,
    shallowEqual
  );
  const [disabled, setDisabled] = useState(false);

  const toggle = () =>
    dispatch({
      type: 'DATA_FILES_TOGGLE_MODAL',
      payload: { operation: 'move', props: {} }
    });

  const onOpened = () => {
    dispatch({
      type: 'FETCH_FILES_MODAL',
      payload: { ...params, section: 'modal' }
    });
  };

  const onClosed = () => {
    dispatch({ type: 'DATA_FILES_MODAL_CLOSE' });
    dispatch({
      type: 'DATA_FILES_SET_OPERATION_STATUS',
      payload: { operation: 'move', status: {} }
    });
    setDisabled(false);
  };

  const moveCallback = useCallback(
    (system, path) => {
      setDisabled(true);
      const filteredSelected = selected.filter(f => status[f.id] !== 'SUCCESS');
      dispatch({
        type: 'DATA_FILES_MOVE',
        payload: {
          dest: { system, path },
          src: filteredSelected,
          reloadCallback: reloadPage
        }
      });
    },
    [selected, reloadPage, status]
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpened={onOpened}
      onClosed={onClosed}
      toggle={toggle}
      size="xl"
      className="dataFilesModal"
    >
      <ModalHeader toggle={toggle}>
        Moving {selected.length} File(s)
      </ModalHeader>
      <ModalBody style={{ height: '70vh' }}>
        <div className="row h-100">
          <div className="col-md-6 d-flex flex-column">
            {/* Table of selected files */}
            <div className="dataFilesModalColHeader">Source</div>
            <DataFilesBreadcrumbs
              api={params.api}
              scheme={params.scheme}
              system={params.system}
              path={params.path || '/'}
              section=""
            />
            <div className="filesListing">
              <DataFilesModalSelectedTable data={selected} operation="move" />
            </div>
          </div>
          <div className="col-md-6 d-flex flex-column">
            <div className="dataFilesModalColHeader">Destination</div>
            <DataFilesBreadcrumbs
              api={modalParams.api}
              scheme={modalParams.scheme}
              system={modalParams.system}
              path={modalParams.path || '/'}
              section="modal"
            />
            <div className="filesListing">
              <DataFilesModalListingTable
                data={files.filter(f => f.format === 'folder')}
                operationName="Move"
                operationCallback={moveCallback}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={disabled}
          onClick={() => moveCallback(modalParams.system, modalParams.path)}
          className="data-files-btn"
        >
          Move to {modalParams.path || '/'}
        </Button>
        <Button
          color="secondary"
          className="data-files-btn-cancel"
          onClick={toggle}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default DataFilesMoveModal;
