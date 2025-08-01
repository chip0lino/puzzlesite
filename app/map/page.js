'use client';

import React, { useEffect, useState } from "react";
import styles from "./map.module.css";

export default function MapPage() {
  const [search, setSearch] = useState("");
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://backpuzzle.up.railway.app/api/marks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch marks: ${response.status}`);
        }

        const data = await response.json();
        setMarks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching marks:', error);
        setError(error.message);
        setMarks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  const filteredMarks = marks.filter(
    (mark) =>
      mark.name?.toLowerCase().includes(search.toLowerCase()) ||
      mark.description?.toLowerCase().includes(search.toLowerCase()) ||
      mark.player_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles["map-container"]}>
        <p>Loading map data...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles["map-container"]}>
        <iframe
          src="http://65.108.206.102:25164/"
          title="Squaremap"
          width="1800"
          height="600"
          frameBorder="0"
          className={styles["map-iframe"]}
        />
      </div>

      <div className={styles["search-tile"]}>
        <input
          type="text"
          placeholder="Search marks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles["search-input"]}
        />
      </div>

      <div className={styles["marks-container"]}>
        {error ? (
          <p className={styles["no-marks-text"]}>Error loading marks: {error}</p>
        ) : filteredMarks.length ? (
          filteredMarks.map((mark) => (
            <div key={mark.id} className={styles["mark-card"]}>
              <div className={styles["mark-header"]}>
                <img
                  src={`https://mc-heads.net/avatar/${mark.player_name}/40`}
                  alt={`${mark.player_name} head`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://crafatar.com/avatars/${mark.player_name}?size=40&default=MHF_Steve`;
                  }}
                />
                <div className={styles["mark-owner"]}>{mark.player_name}</div>
              </div>

              <h3 className={styles["mark-name"]}>{mark.name}</h3>
              <p className={styles["mark-description"]}>
                {mark.description || "No description"}
              </p>
              <div className={styles["mark-info"]}>
                <div>
                  <span className={styles.label}>ID:</span> {mark.mark_id}
                </div>
                <div>
                  <span className={styles.label}>Type:</span> {mark.mark_type}
                </div>
                <div>
                  <span className={styles.label}>Coordinates:</span> {mark.coordinates}
                </div>
                <div>
                  <span className={styles.label}>World:</span> {mark.world}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles["no-marks-text"]}>No marks found.</p>
        )}
      </div>
    </>
  );
}