import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import DialogContainer from "../../hubs/src/react-components/dialog-container";
import { fetchReticulumAuthenticated } from "../../hubs/src/utils/phoenix-utils";


export default class RoomManagementDialog extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    closable: PropTypes.bool
  };

  static defaultProps = {
    closable: true
  };

  constructor(props) {
    super(props);

    this.fileInputRef = createRef();
  }

  onSubmit = async () => {
    const tsv = await this.fileInputRef.current.files[0].text()
    const lines = tsv.split("\n");
    lines.shift();

    for (const line of lines) {
      let [id, name, description, scene_id, group_order, room_order, public] = line.split("\t");
      
      group_order = parseInt(group_order);
      room_order = parseInt(room_order);
      public = public.toLowerCase() === "true";

      if (id) {
        await fetchReticulumAuthenticated(`/api/v1/hubs/${id}`, "PATCH", {
          name,
          description,
          scene_id,
          user_data: {
            group_order,
            room_order
          },
          public
        });
      } else {
        await fetchReticulumAuthenticated(`/api/v1/hubs`, "POST", {
          name,
          description,
          scene_id,
          user_data: {
            group_order,
            room_order
          },
          public
        });
      }
      
    }

    this.props.onClose();
  };

  onDownloadRoomList = async () => {
    const rooms = await fetchReticulumAuthenticated("/api/v1/media/search?source=rooms&filter=public");
    const lines = [];

    const header = ["Room Id", "Room Name", "Room Description", "Scene Id", "Group Order", "Room Order"];
    lines.push(header.join("\t"));

    for (let { id, name, description, scene_id, user_data} of rooms.entries) {
      const groupOrder = user_data && user_data.group_order;
      const roomOrder = user_data && user_data.room_order;
      const line = [id, name || "", description || "", scene_id || "", groupOrder || "", roomOrder || ""];
      lines.push(line.join("\t"));
    }

    const tsv = lines.join("\n");

    const blob = new Blob([tsv], { type: "text/tsv" });

    const downloadEl = document.createElement("a");
    downloadEl.download = "room-list.tsv";
    downloadEl.href = URL.createObjectURL(blob);
    downloadEl.click();
  };

  render() {
    return (
      <DialogContainer title="Room Management" {...this.props}>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="room-management-file">Room List (.tsv)</label>
          <input id="room-management-file" type="file" accept=".tsv" multiple={false} ref={this.fileInputRef} />
          <button type="submit">Update Rooms</button>
          <button type="button" onClick={this.onDownloadRoomList}>Download Room List</button>
        </form>
      </DialogContainer>
    );
  }
}
