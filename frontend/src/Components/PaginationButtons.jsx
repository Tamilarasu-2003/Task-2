import ReactPaginate from 'react-paginate';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { motion } from 'framer-motion';

const PaginationButtons = ({ onPageChange, currentPage, totalCount, productsPerPage }) => {
    const pageCount = Math.ceil(totalCount / productsPerPage);

    const paginationVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.5,
        }
    };

    return (
        <motion.div variants={paginationVariants} initial="hidden" animate="visible">
            <ReactPaginate
                breakLabel={<span className='mr-4'>...</span>}
                nextLabel={
                    <span className='w-10 h-10 flex items-center justify-center rounded-md bg-gray-300'>
                        <BsChevronRight />
                    </span>
                }
                onPageChange={onPageChange}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel={
                    <span className='w-10 h-10 flex items-center justify-center rounded-md bg-gray-300 mr-4'>
                        <BsChevronLeft />
                    </span>
                }
                containerClassName='flex items-center justify-center mt-8 mb-4'
                pageClassName='block border border-solid border-lightGrey hover:bg-gray-300 w-10 h-10 flex items-center justify-center rounded-md mr-4'
                activeClassName='bg-indigo-600 text-white'
                disabledClassName='opacity-50 cursor-not-allowed'
                renderOnZeroPageCount={null}
            />
        </motion.div>
    );
};

export default PaginationButtons;
