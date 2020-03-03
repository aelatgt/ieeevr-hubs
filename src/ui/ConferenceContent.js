import React from "react";
import styles from "./ConferenceContent.scss";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import configs from "../../hubs/src/utils/configs";

function groupFeaturedRooms(featuredRooms) {
  if (!featuredRooms) {
    return [];
  }

  const groups = [];

  for (const room of featuredRooms) {
    const parts = room.name.split(" | ");

    if (parts.length === 2) {
      const [groupName, roomName] = parts;

      let group = groups.find(g => g.name === groupName);

      if (group) {
        group.rooms.push({ ...room, name: roomName, member_cap: room.member_cap || 25 });
      } else {
        groups.push({
          name: groupName,
          description: room.description,
          thumbnail: room.images && room.images.preview && room.images.preview.url,
          rooms: [{ ...room, name: roomName, member_cap: room.member_cap || 25 }]
        });
      }
    } else {
      groups.push({
        name: room.name,
        description: room.description,
        thumbnail: room.images && room.images.preview && room.images.preview.url,
        rooms: [{...room, member_cap: room.member_cap || 25}]
      });
    }
  }

  return groups;
}

function ConferenceRoomGroup({ group }) {
  return (
    <div className={classNames(styles.card, styles.conferenceRoomGroup)}>
      <div className={styles.groupLeft}>
        <h2>{group.name}</h2>
        <p>{group.description}</p>
        <ul className={styles.roomList}>
          {group.rooms.map((room => (
            <li key={room.id}>
              {(room.member_count >= room.member_cap) ?
                <p className={styles.disabledRoomLink}>{room.name} (Full)</p> :
                <a href={room.url}>{room.name}</a>
              }
              <span>
                <FontAwesomeIcon icon={faUsers} />
                <b>{`${room.member_count} / ${room.member_cap}`}</b>
              </span>
            </li>
          )))}
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
          {groupFeaturedRooms(featuredRooms).map((group) => <ConferenceRoomGroup key={group.name} group={group} />)}
        </div>
      </section>
    </main>
  );
}