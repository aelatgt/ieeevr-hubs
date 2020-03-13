import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import DialogContainer from "../../hubs/src/react-components/dialog-container";
import { fetchReticulumAuthenticated } from "../../hubs/src/utils/phoenix-utils";

function parseTSVInt(value) {
  const intVal = parseInt(value);
  return isNaN(intVal) ? undefined : intVal;
}

function parseTSVBool(value) {
  return value.toLowerCase() === "true"
}


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
      let [id, name, description, scene_id, group_order, room_order, room_size, spawn_and_move_media, spawn_camera, spawn_drawing, pin_objects] = line.split("\t");

      const roomParams = {
        hub: {
          name,
          description,
          scene_id: scene_id || undefined,
          user_data: {
            group_order: parseTSVInt(group_order),
            room_order: parseTSVInt(room_order)
          },
          member_permissions: {
            spawn_and_move_media: parseTSVBool(spawn_and_move_media),
            spawn_camera: parseTSVBool(spawn_camera),
            spawn_drawing: parseTSVBool(spawn_drawing),
            pin_objects: parseTSVBool(pin_objects)
          },
          room_size: parseTSVInt(room_size),
          allow_promotion: true
        }
      };

      if (id) {
        await fetchReticulumAuthenticated(`/api/v1/hubs/${id}`, "PATCH", roomParams);
      } else {
        await fetchReticulumAuthenticated(`/api/v1/hubs`, "POST", roomParams);
      }
    }

    this.props.onClose();
  };

  onDownloadRoomList = async () => {
    const rooms = await fetchReticulumAuthenticated("/api/v1/media/search?source=rooms&filter=public");
    const lines = [];

    const header = ["Room Id", "Room Name", "Room Description", "Scene Id", "Group Order", "Room Order", "Room Size", "Spawn and Move Media", "Spawn Camera", "Spawn Drawing", "Pin Objects"];
    lines.push(header.join("\t"));

    for (let { id, name, description, scene_id, user_data, room_size } of rooms.entries) {
      const groupOrder = user_data && user_data.group_order;
      const roomOrder = user_data && user_data.room_order;
      const line = [id, name || "", description || "", scene_id || "", groupOrder || "", roomOrder || "", room_size || "", "false", "false", "false", "false"];
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
