package com.maviniciusdev.vesta.domain.repository;

import com.maviniciusdev.vesta.domain.model.Produto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {


    Optional<Produto> findBySku(String sku);

    List<Produto> findAllByOrderByDataCadastroDesc(Pageable pageable);

    @Query("select coalesce(sum(p.quantidade), 0) from Produto p")
    long somarTotalItensEmEstoque();

    long countByQuantidadeLessThanEqual(@Param("limiar") Integer limiar);

    List<Produto> findByQuantidadeLessThanEqualOrderByQuantidadeAsc(@Param("limiar") Integer limiar);

}