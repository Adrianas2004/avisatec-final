const pool = require("../config/db");

/*
========================================
NUEVOS CURSOS PARA EL USUARIO
========================================
*/

const getNewCoursesForUser = async (req, res) => { 
  
  try { 
    const { userId } = req.params; 
    const result = await pool.query( 
      ` 
      SELECT DISTINCT 
        p.* 
        
      FROM publicaciones p 
      
      INNER JOIN publicacion_categorias pc 
        ON pc.publicacion_id = p.id 
        
      INNER JOIN intereses_usuario iu 
        ON iu.categoria_id = pc.categoria_id 
        
      WHERE iu.usuario_id = $1 
      
      /* ======================================== 
      SOLO CURSOS RECIENTES 
      ======================================== 
      */ 
      AND p.created_at >= NOW() - INTERVAL '7 days' 
      
      ORDER BY p.created_at DESC 
      
      LIMIT 20 
      `, 
      [userId] 
    ); 
    
    res.json(result.rows); 
  } catch (error) { 
    
    console.log(error); 
    
    res.status(500).json({ 
      error: "Error obteniendo cursos nuevos" 
    }); 
  } 
}; 

module.exports = { 
  getNewCoursesForUser, 
};

