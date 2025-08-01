"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./TeamPage.module.css";
import Link from "next/link";

export default function TeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  

  useEffect(() => {
    fetch(`http://localhost:5000/api/teams/${id}`)
      .then(res => res.json())
      .then(data => setTeam(data));

    fetch(`http://localhost:5000/api/team_members/${id}`)
      .then(res => res.json())
      .then(data => setMembers(data));
  }, [id]);

  if (!team) return <div className={styles.loading}>Loading...</div>;

  const filtered = members.filter(member =>
    member.player_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.teamPage}>
      <div className={styles.teamLayout}>

        {/* Левая часть */}
        <div className={styles.teamLeft}>
          <div className={styles.bannerAndName}>
            <img src={team.banner_link} alt="banner" className={styles.banner} />
            <div className={styles.nameMeta}>
              <h1 className={styles.teamName}>{team.name}</h1>
              <p className={styles.teamDesc}>{team.desc}</p>
              <p className={styles.teamMeta}>
                {team.members_count} member{team.members_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Правая часть */}
        <div className={styles.teamRight}>
          <h2 className={styles.membersTitle}>
            Members <span>({filtered.length})</span>
          </h2>

          <input
            type="text"
            placeholder="Search members..."
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className={styles.memberList}>
            {filtered.map((member) => {
              const isOwner = member.player_name === team.owner_name;
              return (
                <Link
                  href={`/u/${member.player_name}`}
                  key={member.player_id}
                  className={styles.member}
                >
                  {isOwner && (
                    <img
                      src="/assets/crown.png"
                      alt="Owner Crown"
                      className={styles.crownIcon}
                    />
                  )}
                  <img
                    src={`https://mc-heads.net/avatar/${member.player_name}/32`}
                    alt={member.player_name}
                  />
                  <span>{member.player_name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
