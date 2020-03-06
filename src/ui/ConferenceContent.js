import React from "react";
import styles from "./ConferenceContent.scss";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import configs from "../../hubs/src/utils/configs";

const maxRoomCap = configs.feature("max_room_cap") || 50;

function groupFeaturedRooms(featuredRooms) {
  if (!featuredRooms) {
    return [];
  }

  let groups = [];

  for (const room of featuredRooms) {
    const parts = room.name.split(" | ");

    if (parts.length === 2) {
      const [groupName, roomName] = parts;

      let group = groups.find(g => g.name === groupName);

      if (group) {
        group.rooms.push({ ...room, name: roomName });
      } else {
        groups.push({
          name: groupName,
          rooms: [{ ...room, name: roomName }],
          user_data: room.user_data
        });
      }
    } else {
      groups.push({
        name: room.name,
        rooms: [room],
        user_data: room.user_data
      });
    }
  }

  groups = groups.sort((a, b) => {
    if (a.user_data && a.user_data.group_order !== undefined && b.user_data && b.user_data.group_order !== undefined) {
      return a.user_data.group_order - b.user_data.group_order;
    }

    if (a.user_data && a.user_data.group_order !== undefined) {
      return -1;
    }

    if (b.user_data && b.user_data.group_order !== undefined) {
      return 1;
    }

    return 0;
  });

  for (const group of groups) {
    group.rooms = group.rooms.sort((a, b) => {
      if (a.user_data && a.user_data.room_order !== undefined && b.user_data && b.user_data.room_order !== undefined ) {
        return a.user_data.room_order - b.user_data.room_order;
      }
  
      if (a.user_data && a.user_data.room_order !== undefined) {
        return -1;
      }
  
      if (b.user_data && b.user_data.room_order !== undefined) {
        return 1;
      }
  
      return 0;
    });

    const mainRoom = group.rooms[0];
    group.description =  mainRoom.description;
    group.thumbnail = mainRoom.images && mainRoom.images.preview && mainRoom.images.preview.url;
  }

  return groups;
}

function RoomItem({ room }) {
  let canSpectate = true;
  let canJoin = true;

  if (room.member_count + room.lobby_count >= maxRoomCap) {
    canSpectate = false;
  }
  
  if (room.member_count >= room.room_size) {
    canJoin = false;
  }

  return (
    <li key={room.id}>
      <p className={styles.roomTitle}>{room.name}</p>
      <span>
        <FontAwesomeIcon icon={faUsers} />
        <b>{`${room.member_count} / ${room.room_size}`}</b>
        {canSpectate ? 
          <a className={classNames(styles.joinButton)} href={room.url} >{canJoin ? "Join" : "Spectate"}</a> :
          <p className={classNames(styles.joinButton, styles.joinButtonDisabled)}>Full</p>
        }
      </span>
    </li>
  );
}

function ConferenceRoomGroup({ group }) {
  return (
    <div className={classNames(styles.card, styles.conferenceRoomGroup)}>
      <div className={styles.groupLeft}>
        <h2>{group.name}</h2>
        {group.description && <p>{group.description}</p>}
        <ul className={styles.roomList}>
          {group.rooms.map(room => <RoomItem key={room.id} room={room} />)}
        </ul>
      </div>
      <div className={styles.groupRight}>
        <img alt={group.name} src={group.thumbnail} />
      </div>
    </div>
  )
}

export default function ConferenceContent({ featuredRooms }) {
  return (
    <main className={styles.conferenceContent}>
      <section className={styles.heroContainer}>
        <div className={styles.contentContainer}>
          <div className={styles.centered}>
            <img src={configs.image("logo")} />
          </div>
        </div>
      </section>
      <section className={styles.descriptionContainer}>
        <div className={styles.contentContainer}>
          <div className={classNames(styles.card, styles.centered)}>
            <h1>IEEE VR Online</h1>
            Description of what the IEEE VR Online experience is.
          </div>
        </div>
      </section>
      <section>
        <div className={styles.contentContainer}>
          <div className={styles.centered}>
            <h1>Virtual Rooms</h1>
          </div>
          {groupFeaturedRooms(featuredRooms).map((group) => <ConferenceRoomGroup key={group.name} group={group} />)}
        </div>
      </section>
    </main>
  );
}