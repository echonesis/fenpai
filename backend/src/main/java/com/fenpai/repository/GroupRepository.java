package com.fenpai.repository;

import com.fenpai.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT DISTINCT g FROM Group g JOIN FETCH g.createdBy JOIN g.members m WHERE m.user.id = :userId")
    List<Group> findGroupsByUserId(@Param("userId") Long userId);

    @Query("SELECT g FROM Group g JOIN FETCH g.createdBy WHERE g.id = :id")
    Optional<Group> findByIdWithCreator(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM Group g WHERE g.id = :groupId")
    void deleteByIdDirect(@Param("groupId") Long groupId);
}
